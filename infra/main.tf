terraform {
  required_version = ">= 1.9"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
  }
  backend "gcs" {
    # Configure with: terraform init -backend-config="bucket=certflow-tfstate"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

resource "google_project_service" "services" {
  for_each = toset([
    "run.googleapis.com",
    "sqladmin.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "secretmanager.googleapis.com",
    "artifactregistry.googleapis.com",
  ])
  service = each.key
}

# Artifact Registry for container images
resource "google_artifact_registry_repository" "repo" {
  location      = var.region
  repository_id = "certflow"
  format        = "DOCKER"
  depends_on    = [google_project_service.services]
}

# Cloud SQL PostgreSQL
resource "google_sql_database_instance" "main" {
  name             = "certflow-db"
  database_version = "POSTGRES_16"
  region           = var.region

  settings {
    tier              = "db-f1-micro"
    availability_type = "ZONAL"
    disk_size         = 10

    ip_configuration {
      ipv4_enabled = true
      authorized_networks {
        name  = "cloud-run"
        value = "0.0.0.0/0"
      }
    }
  }

  deletion_protection = false
  depends_on = [google_project_service.services]
}

resource "google_sql_database" "main" {
  name     = "zentra"
  instance = google_sql_database_instance.main.name
}

resource "google_sql_user" "main" {
  name     = "zentra"
  instance = google_sql_database_instance.main.name
  password = random_password.db_password.result
}

resource "random_password" "db_password" {
  length  = 32
  special = false
}

# Secret Manager for DB password + JWT secret
resource "google_secret_manager_secret" "db_password" {
  secret_id = "certflow-db-password"
  replication {
    auto {}
  }
  depends_on = [google_project_service.services]
}

resource "google_secret_manager_secret_version" "db_password" {
  secret      = google_secret_manager_secret.db_password.id
  secret_data = random_password.db_password.result
}

# Cloud Run service
resource "google_cloud_run_v2_service" "api" {
  name     = "certflow-api"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    containers {
      image = "${var.region}-docker.pkg.dev/${var.project_id}/certflow/api:latest"
      ports { container_port = 8080 }

      env {
        name  = "DATABASE_URL"
        value = "postgres://zentra:${random_password.db_password.result}@${google_sql_database_instance.main.public_ip_address}:5432/zentra?sslmode=disable"
      }
      env {
        name  = "JWT_SECRET"
        value = random_password.db_password.result
      }

      resources {
        limits = { cpu = "1", memory = "512Mi" }
      }
    }
  }

  depends_on = [google_project_service.services, google_sql_database_instance.main]
}

# Public access
resource "google_cloud_run_v2_service_iam_member" "public" {
  project  = google_cloud_run_v2_service.api.project
  location = google_cloud_run_v2_service.api.location
  name     = google_cloud_run_v2_service.api.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

output "api_url" {
  value = google_cloud_run_v2_service.api.uri
}

output "db_ip" {
  value = google_sql_database_instance.main.public_ip_address
}

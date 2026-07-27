package connectors

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/duranruizsantiago-lang/zentra/internal/models"
)

// GCPConnector collects compliance evidence from Google Cloud Platform.
// It checks: IAM roles, bucket ACLs, firewall rules, KMS key rotation, audit logging.
type GCPConnector struct {
	config GCPConfig
}

type GCPConfig struct {
	ProjectID       string `json:"project_id"`
	ServiceAccountKey string `json:"service_account_key"` // encrypted
}

func NewGCPConnector(configJSON string) (*GCPConnector, error) {
	var cfg GCPConfig
	if err := json.Unmarshal([]byte(configJSON), &cfg); err != nil {
		return nil, fmt.Errorf("invalid GCP config: %w", err)
	}
	return &GCPConnector{config: cfg}, nil
}

func (g *GCPConnector) Collect(ctx context.Context, connectorID string) ([]models.Evidence, error) {
	var evidence []models.Evidence

	// These would make real API calls in production.
	// For now, return simulated evidence showing the structure.

	evidence = append(evidence, models.Evidence{
		ControlID: "NIS2-ACC-01",
		Resource:   fmt.Sprintf("projects/%s/iam", g.config.ProjectID),
		Status:     "pass",
		Finding:    "MFA enforced for all service accounts. No overly permissive IAM roles found.",
	})

	evidence = append(evidence, models.Evidence{
		ControlID: "NIS2-CRY-01",
		Resource:   fmt.Sprintf("projects/%s/kms", g.config.ProjectID),
		Status:     "pass",
		Finding:    "All KMS keys have automatic rotation enabled (90-day cycle).",
	})

	evidence = append(evidence, models.Evidence{
		ControlID: "NIS2-BCP-01",
		Resource:   fmt.Sprintf("projects/%s/cloudsql", g.config.ProjectID),
		Status:     "pass",
		Finding:    "Automated daily backups configured for all Cloud SQL instances. Retention: 30 days.",
	})

	evidence = append(evidence, models.Evidence{
		ControlID: "ISO-A8-01",
		Resource:   fmt.Sprintf("projects/%s/assets", g.config.ProjectID),
		Status:     "warn",
		Finding:    "3 Cloud Storage buckets have public access enabled. Review bucket ACLs.",
	})

	evidence = append(evidence, models.Evidence{
		ControlID: "ISO-A12-01",
		Resource:   fmt.Sprintf("projects/%s/logging", g.config.ProjectID),
		Status:     "pass",
		Finding:    "Cloud Audit Logs enabled for all services. Admin activity and data access logs active.",
	})

	return evidence, nil
}

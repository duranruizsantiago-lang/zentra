package models

import (
	"time"

	"github.com/google/uuid"
)

type Organization struct {
	ID        uuid.UUID `json:"id"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type User struct {
	ID             uuid.UUID `json:"id"`
	OrganizationID uuid.UUID `json:"organization_id"`
	Email          string    `json:"email"`
	PasswordHash   string    `json:"-"`
	Role           string    `json:"role"`
	CreatedAt      time.Time `json:"created_at"`
}

type ConnectorType string

const (
	ConnectorGCP   ConnectorType = "gcp"
	ConnectorAWS   ConnectorType = "aws"
	ConnectorAzure ConnectorType = "azure"
)

type Connector struct {
	ID             uuid.UUID     `json:"id"`
	OrganizationID uuid.UUID     `json:"organization_id"`
	Name           string        `json:"name"`
	Type           ConnectorType `json:"type"`
	Config         string        `json:"-"` // encrypted JSON config
	Status         string        `json:"status"`
	LastScanAt     *time.Time    `json:"last_scan_at"`
	CreatedAt      time.Time     `json:"created_at"`
}

type ControlFramework string

const (
	FrameworkNIS2      ControlFramework = "NIS2"
	FrameworkDORA      ControlFramework = "DORA"
	FrameworkISO27001  ControlFramework = "ISO27001"
	FrameworkENS       ControlFramework = "ENS"
)

type Control struct {
	ID          string           `json:"id"`
	Framework   ControlFramework `json:"framework"`
	Category    string           `json:"category"`
	Code        string           `json:"code"`
	Title       string           `json:"title"`
	Description string           `json:"description"`
	Severity    string           `json:"severity"`
}

type Evidence struct {
	ID          uuid.UUID  `json:"id"`
	ControlID   string     `json:"control_id"`
	ConnectorID uuid.UUID  `json:"connector_id"`
	Resource    string     `json:"resource"`
	Status      string     `json:"status"` // pass, fail, warn, manual
	Finding     string     `json:"finding"`
	RawData     string     `json:"raw_data"`
	CollectedAt time.Time  `json:"collected_at"`
}

type ComplianceScore struct {
	Framework ControlFramework `json:"framework"`
	Score     float64          `json:"score"`
	Pass      int              `json:"pass"`
	Fail      int              `json:"fail"`
	Warn      int              `json:"warn"`
	Manual    int              `json:"manual"`
	Total     int              `json:"total"`
}

type ScanResult struct {
	ConnectorID uuid.UUID  `json:"connector_id"`
	StartedAt   time.Time  `json:"started_at"`
	CompletedAt time.Time  `json:"completed_at"`
	Evidence    []Evidence `json:"evidence"`
}

// API types
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginResponse struct {
	Token        string `json:"token"`
	RefreshToken string `json:"refresh_token"`
}

type CreateConnectorRequest struct {
	Name   string        `json:"name"`
	Type   ConnectorType `json:"type"`
	Config string        `json:"config"`
}

type DashboardResponse struct {
	Organization  Organization      `json:"organization"`
	Scores        []ComplianceScore `json:"scores"`
	TotalEvidence int               `json:"total_evidence"`
	Connectors    int               `json:"connectors"`
	LastScanAt    *time.Time        `json:"last_scan_at"`
}

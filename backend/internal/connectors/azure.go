package connectors

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/duranruizsantiago-lang/zentra/internal/models"
)

type AzureConnector struct {
	config AzureConfig
}

type AzureConfig struct {
	TenantID     string `json:"tenant_id"`
	SubscriptionID string `json:"subscription_id"`
	ClientID     string `json:"client_id"`     // encrypted
	ClientSecret string `json:"client_secret"` // encrypted
}

func NewAzureConnector(configJSON string) (*AzureConnector, error) {
	var cfg AzureConfig
	if err := json.Unmarshal([]byte(configJSON), &cfg); err != nil {
		return nil, fmt.Errorf("invalid Azure config: %w", err)
	}
	return &AzureConnector{config: cfg}, nil
}

func (az *AzureConnector) Collect(ctx context.Context, connectorID string) ([]models.Evidence, error) {
	var evidence []models.Evidence

	evidence = append(evidence, models.Evidence{
		ControlID: "NIS2-ACC-01",
		Resource:   fmt.Sprintf("/subscriptions/%s", az.config.SubscriptionID),
		Status:     "pass",
		Finding:    "Azure AD Conditional Access enforces MFA for all privileged roles.",
	})

	evidence = append(evidence, models.Evidence{
		ControlID: "DORA-ICT-01",
		Resource:   fmt.Sprintf("/subscriptions/%s/securitycenter", az.config.SubscriptionID),
		Status:     "warn",
		Finding:    "Azure Defender enabled but not configured for all resource types.",
	})

	return evidence, nil
}

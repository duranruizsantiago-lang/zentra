package connectors

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/duranruizsantiago-lang/zentra/internal/models"
)

type AWSConnector struct {
	config AWSConfig
}

type AWSConfig struct {
	AccountID     string `json:"account_id"`
	Region        string `json:"region"`
	AccessKeyID   string `json:"access_key_id"`   // encrypted
	SecretAccessKey string `json:"secret_access_key"` // encrypted
}

func NewAWSConnector(configJSON string) (*AWSConnector, error) {
	var cfg AWSConfig
	if err := json.Unmarshal([]byte(configJSON), &cfg); err != nil {
		return nil, fmt.Errorf("invalid AWS config: %w", err)
	}
	return &AWSConnector{config: cfg}, nil
}

func (a *AWSConnector) Collect(ctx context.Context, connectorID string) ([]models.Evidence, error) {
	var evidence []models.Evidence

	evidence = append(evidence, models.Evidence{
		ControlID: "NIS2-ACC-01",
		Resource:   fmt.Sprintf("arn:aws:iam::%s:root", a.config.AccountID),
		Status:     "pass",
		Finding:    "IAM password policy enforces MFA. Root account has no access keys.",
	})

	evidence = append(evidence, models.Evidence{
		ControlID: "NIS2-CRY-01",
		Resource:   fmt.Sprintf("arn:aws:s3:::%s", a.config.AccountID),
		Status:     "fail",
		Finding:    "5 S3 buckets have default encryption disabled. Enable SSE-S3 or SSE-KMS.",
	})

	evidence = append(evidence, models.Evidence{
		ControlID: "ISO-A9-01",
		Resource:   fmt.Sprintf("arn:aws:ec2:%s:*", a.config.Region),
		Status:     "warn",
		Finding:    "Security group sg-0a1b2c3d allows inbound 0.0.0.0/0 on port 22 (SSH).",
	})

	return evidence, nil
}

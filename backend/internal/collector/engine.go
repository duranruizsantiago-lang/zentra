package collector

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/duranruizsantiago-lang/zentra/internal/connectors"
	"github.com/duranruizsantiago-lang/zentra/internal/models"
	"github.com/duranruizsantiago-lang/zentra/internal/store"
)

type Engine struct {
	store *store.Store
}

func NewEngine(s *store.Store) *Engine {
	return &Engine{store: s}
}

// RunScan executes a full compliance scan for a connector.
func (e *Engine) RunScan(ctx context.Context, connectorID string, orgID string) (*models.ScanResult, error) {
	// Fetch connector config
	var cType string
	var configJSON string
	err := e.store.Pool.QueryRow(ctx,
		"SELECT type, config FROM connectors WHERE id = $1 AND organization_id = $2",
		connectorID, orgID,
	).Scan(&cType, &configJSON)
	if err != nil {
		return nil, fmt.Errorf("connector not found: %w", err)
	}

	startedAt := time.Now()

	var evidence []models.Evidence

	switch models.ConnectorType(cType) {
	case models.ConnectorGCP:
		gcp, err := connectors.NewGCPConnector(configJSON)
		if err != nil {
			return nil, err
		}
		evidence, err = gcp.Collect(ctx, connectorID)

	case models.ConnectorAWS:
		aws, err := connectors.NewAWSConnector(configJSON)
		if err != nil {
			return nil, err
		}
		evidence, err = aws.Collect(ctx, connectorID)

	case models.ConnectorAzure:
		az, err := connectors.NewAzureConnector(configJSON)
		if err != nil {
			return nil, err
		}
		evidence, err = az.Collect(ctx, connectorID)

	default:
		return nil, fmt.Errorf("unsupported connector type: %s", cType)
	}

	// Store evidence
	for i := range evidence {
		rawJSON, _ := json.Marshal(map[string]interface{}{
			"connector_id": connectorID,
			"collected_at": time.Now().UTC().Format(time.RFC3339),
		})
		_, err := e.store.Pool.Exec(ctx,
			"INSERT INTO evidence (control_id, connector_id, resource, status, finding, raw_data, collected_at) VALUES ($1, $2, $3, $4, $5, $6, $7)",
			evidence[i].ControlID, connectorID, evidence[i].Resource, evidence[i].Status, evidence[i].Finding, string(rawJSON), time.Now(),
		)
		if err != nil {
			log.Printf("failed to store evidence: %v", err)
		}
	}

	// Update connector last_scan_at
	e.store.Pool.Exec(ctx, "UPDATE connectors SET last_scan_at = $1, status = 'connected' WHERE id = $2", time.Now(), connectorID)

	return &models.ScanResult{
		ConnectorID: connectorID,
		StartedAt:   startedAt,
		CompletedAt: time.Now(),
		Evidence:    evidence,
	}, nil
}

// CalculateScores computes compliance scores across all frameworks.
func (e *Engine) CalculateScores(ctx context.Context, orgID string) ([]models.ComplianceScore, error) {
	rows, err := e.store.Pool.Query(ctx,
		`SELECT c.framework, e.status, COUNT(*)
		FROM evidence e 
		JOIN controls c ON e.control_id = c.id
		JOIN connectors co ON e.connector_id = co.id
		WHERE co.organization_id = $1
		GROUP BY c.framework, e.status
		ORDER BY c.framework`,
		orgID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	// Aggregate by framework
	frameworks := map[models.ControlFramework]map[string]int{}
	for rows.Next() {
		var fw, status string
		var count int
		rows.Scan(&fw, &status, &count)
		cf := models.ControlFramework(fw)
		if frameworks[cf] == nil {
			frameworks[cf] = map[string]int{}
		}
		frameworks[cf][status] = count
	}

	var scores []models.ComplianceScore
	for fw, counts := range frameworks {
		total := counts["pass"] + counts["fail"] + counts["warn"] + counts["manual"]
		score := 0.0
		if total > 0 {
			score = float64(counts["pass"]) / float64(total) * 100
		}
		scores = append(scores, models.ComplianceScore{
			Framework: fw,
			Score:     score,
			Pass:      counts["pass"],
			Fail:      counts["fail"],
			Warn:      counts["warn"],
			Manual:    counts["manual"],
			Total:     total,
		})
	}

	return scores, nil
}

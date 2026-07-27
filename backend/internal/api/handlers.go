package api

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"

	"github.com/duranruizsantiago-lang/zentra/internal/auth"
	"github.com/duranruizsantiago-lang/zentra/internal/models"
)

func (s *Server) handleHealth(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{
		"status": "healthy",
		"time":   time.Now().UTC().Format(time.RFC3339),
	})
}

func (s *Server) handleRegister(w http.ResponseWriter, r *http.Request) {
	var req struct {
		OrgName  string `json:"organization_name"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to hash password")
		return
	}

	ctx := r.Context()

	// Create organization
	var orgID uuid.UUID
	err = s.store.Pool.QueryRow(ctx,
		"INSERT INTO organizations (name) VALUES ($1) RETURNING id", req.OrgName,
	).Scan(&orgID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to create organization")
		return
	}

	// Create user
	var userID uuid.UUID
	err = s.store.Pool.QueryRow(ctx,
		"INSERT INTO users (organization_id, email, password_hash, role) VALUES ($1, $2, $3, 'admin') RETURNING id",
		orgID, req.Email, string(hash),
	).Scan(&userID)
	if err != nil {
		writeError(w, http.StatusConflict, "user already exists")
		return
	}

	token, _ := auth.GenerateToken(userID, orgID, req.Email, "admin")
	writeJSON(w, http.StatusCreated, models.LoginResponse{Token: token})
}

func (s *Server) handleLogin(w http.ResponseWriter, r *http.Request) {
	var req models.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	ctx := r.Context()
	var user models.User
	err := s.store.Pool.QueryRow(ctx,
		"SELECT id, organization_id, email, password_hash, role FROM users WHERE email = $1",
		req.Email,
	).Scan(&user.ID, &user.OrganizationID, &user.Email, &user.PasswordHash, &user.Role)
	if err != nil {
		writeError(w, http.StatusUnauthorized, "invalid credentials")
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		writeError(w, http.StatusUnauthorized, "invalid credentials")
		return
	}

	token, _ := auth.GenerateToken(user.ID, user.OrganizationID, user.Email, user.Role)
	refreshToken, _ := auth.GenerateRefreshToken(user.ID)
	writeJSON(w, http.StatusOK, models.LoginResponse{Token: token, RefreshToken: refreshToken})
}

func (s *Server) handleDashboard(w http.ResponseWriter, r *http.Request) {
	claims := auth.GetClaims(r)
	if claims == nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	ctx := r.Context()
	var org models.Organization
	s.store.Pool.QueryRow(ctx, "SELECT id, name, created_at, updated_at FROM organizations WHERE id = $1", claims.OrganizationID).
		Scan(&org.ID, &org.Name, &org.CreatedAt, &org.UpdatedAt)

	// Count evidence
	var evidenceCount int
	s.store.Pool.QueryRow(ctx,
		"SELECT COUNT(*) FROM evidence e JOIN connectors c ON e.connector_id = c.id WHERE c.organization_id = $1",
		claims.OrganizationID,
	).Scan(&evidenceCount)

	// Count connectors
	var connectorCount int
	s.store.Pool.QueryRow(ctx,
		"SELECT COUNT(*) FROM connectors WHERE organization_id = $1",
		claims.OrganizationID,
	).Scan(&connectorCount)

	// Get scores
	scores := s.calculateScores(ctx, claims.OrganizationID)

	dashboard := models.DashboardResponse{
		Organization:  org,
		Scores:        scores,
		TotalEvidence: evidenceCount,
		Connectors:    connectorCount,
	}

	writeJSON(w, http.StatusOK, dashboard)
}

func (s *Server) handleScores(w http.ResponseWriter, r *http.Request) {
	claims := auth.GetClaims(r)
	if claims == nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	scores := s.calculateScores(r.Context(), claims.OrganizationID)
	writeJSON(w, http.StatusOK, scores)
}

func (s *Server) calculateScores(ctx interface{}, orgID uuid.UUID) []models.ComplianceScore {
	// implementation in collector package
	return nil // TODO
}

func (s *Server) handleListControls(w http.ResponseWriter, r *http.Request) {
	claims := auth.GetClaims(r)
	if claims == nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	framework := r.URL.Query().Get("framework")
	ctx := r.Context()

	var rows interface{}
	var err error
	if framework != "" {
		rows, err = s.store.Pool.Query(ctx,
			"SELECT id, framework, category, code, title, description, severity FROM controls WHERE framework = $1 ORDER BY category, code",
			framework,
		)
	} else {
		rows, err = s.store.Pool.Query(ctx,
			"SELECT id, framework, category, code, title, description, severity FROM controls ORDER BY framework, category, code",
		)
	}
	_ = rows
	_ = err
	_ = claims

	writeJSON(w, http.StatusOK, []models.Control{})
}

func (s *Server) handleControlEvidence(w http.ResponseWriter, r *http.Request) {
	controlID := chi.URLParam(r, "id")
	// TODO: query evidence for this control
	writeJSON(w, http.StatusOK, map[string]string{"control_id": controlID, "evidence": "[]"})
}

func (s *Server) handleListConnectors(w http.ResponseWriter, r *http.Request) {
	claims := auth.GetClaims(r)
	if claims == nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	ctx := r.Context()
	rows, err := s.store.Pool.Query(ctx,
		"SELECT id, organization_id, name, type, config, status, last_scan_at, created_at FROM connectors WHERE organization_id = $1 ORDER BY created_at DESC",
		claims.OrganizationID,
	)
	if err != nil {
		writeJSON(w, http.StatusOK, []models.Connector{})
		return
	}
	defer rows.Close()

	connectors := []models.Connector{}
	for rows.Next() {
		var c models.Connector
		rows.Scan(&c.ID, &c.OrganizationID, &c.Name, &c.Type, &c.Config, &c.Status, &c.LastScanAt, &c.CreatedAt)
		connectors = append(connectors, c)
	}

	writeJSON(w, http.StatusOK, connectors)
}

func (s *Server) handleCreateConnector(w http.ResponseWriter, r *http.Request) {
	claims := auth.GetClaims(r)
	if claims == nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var req models.CreateConnectorRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	var id uuid.UUID
	err := s.store.Pool.QueryRow(r.Context(),
		"INSERT INTO connectors (organization_id, name, type, config) VALUES ($1, $2, $3, $4) RETURNING id",
		claims.OrganizationID, req.Name, req.Type, req.Config,
	).Scan(&id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to create connector")
		return
	}

	writeJSON(w, http.StatusCreated, map[string]string{"id": id.String()})
}

func (s *Server) handleDeleteConnector(w http.ResponseWriter, r *http.Request) {
	claims := auth.GetClaims(r)
	connectorID := chi.URLParam(r, "id")

	_, err := s.store.Pool.Exec(r.Context(),
		"DELETE FROM connectors WHERE id = $1 AND organization_id = $2",
		connectorID, claims.OrganizationID,
	)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to delete connector")
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"status": "deleted"})
}

func (s *Server) handleTriggerScan(w http.ResponseWriter, r *http.Request) {
	connectorID := chi.URLParam(r, "id")
	// TODO: trigger async scan via collector
	writeJSON(w, http.StatusAccepted, map[string]string{
		"connector_id": connectorID,
		"status":       "scan_triggered",
	})
}

func (s *Server) handleListEvidence(w http.ResponseWriter, r *http.Request) {
	claims := auth.GetClaims(r)
	ctx := r.Context()

	rows, err := s.store.Pool.Query(ctx,
		`SELECT e.id, e.control_id, e.connector_id, e.resource, e.status, e.finding, e.collected_at 
		FROM evidence e JOIN connectors c ON e.connector_id = c.id 
		WHERE c.organization_id = $1 ORDER BY e.collected_at DESC LIMIT 50`,
		claims.OrganizationID,
	)
	if err != nil {
		writeJSON(w, http.StatusOK, []models.Evidence{})
		return
	}
	defer rows.Close()

	evidence := []models.Evidence{}
	for rows.Next() {
		var e models.Evidence
		rows.Scan(&e.ID, &e.ControlID, &e.ConnectorID, &e.Resource, &e.Status, &e.Finding, &e.CollectedAt)
		evidence = append(evidence, e)
	}

	writeJSON(w, http.StatusOK, evidence)
}

func (s *Server) handleGetEvidence(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	// TODO
	writeJSON(w, http.StatusOK, map[string]string{"id": id})
}

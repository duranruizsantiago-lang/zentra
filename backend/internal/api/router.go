package api

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	chimw "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"

	"github.com/duranruizsantiago-lang/zentra/internal/auth"
	"github.com/duranruizsantiago-lang/zentra/internal/store"
)

type Server struct {
	router chi.Router
	store  *store.Store
}

func NewServer(s *store.Store) *Server {
	srv := &Server{
		router: chi.NewRouter(),
		store:  s,
	}

	srv.setupMiddleware()
	srv.setupRoutes()
	return srv
}

func (s *Server) setupMiddleware() {
	s.router.Use(chimw.Logger)
	s.router.Use(chimw.Recoverer)
	s.router.Use(chimw.RequestID)
	s.router.Use(chimw.RealIP)
	s.router.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))
}

func (s *Server) setupRoutes() {
	// Health check
	s.router.Get("/health", s.handleHealth)

	// Auth (public)
	s.router.Post("/api/v1/auth/register", s.handleRegister)
	s.router.Post("/api/v1/auth/login", s.handleLogin)

	// Protected routes
	s.router.Group(func(r chi.Router) {
		r.Use(auth.Middleware)

		// Dashboard
		r.Get("/api/v1/dashboard", s.handleDashboard)

		// Compliance scores
		r.Get("/api/v1/scores", s.handleScores)

		// Controls
		r.Get("/api/v1/controls", s.handleListControls)
		r.Get("/api/v1/controls/{id}/evidence", s.handleControlEvidence)

		// Connectors
		r.Get("/api/v1/connectors", s.handleListConnectors)
		r.Post("/api/v1/connectors", s.handleCreateConnector)
		r.Delete("/api/v1/connectors/{id}", s.handleDeleteConnector)
		r.Post("/api/v1/connectors/{id}/scan", s.handleTriggerScan)

		// Evidence
		r.Get("/api/v1/evidence", s.handleListEvidence)
		r.Get("/api/v1/evidence/{id}", s.handleGetEvidence)
	})
}

func (s *Server) Handler() http.Handler {
	return s.router
}

// Helpers
func writeJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func writeError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]string{"error": msg})
}

package users

import (
	"github.com/ffk00/iyte-hci-vespin/backend/internal/auth"
	"github.com/ffk00/iyte-hci-vespin/backend/internal/db"
	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Handler struct {
	queries *db.Queries
	pool    *pgxpool.Pool
	tokens  *auth.Tokens
}

func NewHandler(q *db.Queries, pool *pgxpool.Pool, tokens *auth.Tokens) *Handler {
	return &Handler{queries: q, pool: pool, tokens: tokens}
}

func (h *Handler) RegisterRoutes(r chi.Router) {
}

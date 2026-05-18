package partysessions

import (
	"github.com/ffk00/iyte-hci-vespin/backend/internal/db"
	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Handler struct {
	queries *db.Queries
	pool    *pgxpool.Pool
}

func NewHandler(q *db.Queries, pool *pgxpool.Pool) *Handler {
	return &Handler{queries: q, pool: pool}
}

func (h *Handler) RegisterRoutes(r chi.Router) {
}

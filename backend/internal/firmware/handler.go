package firmware

import (
	"github.com/ffk00/iyte-hci-vespin/backend/internal/config"
	"github.com/go-chi/chi/v5"
)

type Handler struct {
	cfg config.Config
}

func NewHandler(cfg config.Config) *Handler {
	return &Handler{cfg: cfg}
}

func (h *Handler) RegisterRoutes(r chi.Router) {
}

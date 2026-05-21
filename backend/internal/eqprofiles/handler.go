package eqprofiles

import (
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"strings"

	"github.com/ffk00/iyte-hci-vespin/backend/internal/auth"
	"github.com/ffk00/iyte-hci-vespin/backend/internal/db"
	"github.com/ffk00/iyte-hci-vespin/backend/internal/httpx"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
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
	r.Get("/", h.list)
	r.Post("/", h.create)
	r.Get("/{id}", h.get)
	r.Patch("/{id}", h.update)
	r.Delete("/{id}", h.delete)
	r.Post("/{id}/fork", h.fork)
}

func (h *Handler) list(w http.ResponseWriter, r *http.Request) {
	userID := auth.UserIDFromContext(r.Context())

	var (
		rows []db.EqProfile
		err  error
	)
	switch r.URL.Query().Get("type") {
	case "":
		rows, err = h.queries.ListAccessibleEQProfiles(r.Context(), uuidToPg(userID))
	case "system":
		rows, err = h.queries.ListSystemEQProfiles(r.Context())
	case "custom":
		rows, err = h.queries.ListCustomEQProfiles(r.Context(), uuidToPg(userID))
	default:
		httpx.WriteError(w, httpx.NewValidationError(
			map[string]string{"type": "must be one of: system custom"}, nil))
		return
	}
	if err != nil {
		slog.ErrorContext(r.Context(), "list eq profiles failed", "error", err, "user_id", userID)
		httpx.WriteError(w, fmt.Errorf("list eq profiles: %w", err))
		return
	}

	resp, err := ToListResponse(rows)
	if err != nil {
		slog.ErrorContext(r.Context(), "marshal eq profiles failed", "error", err)
		httpx.WriteError(w, err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, resp)
}

func (h *Handler) create(w http.ResponseWriter, r *http.Request) {
	var req CreateRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		httpx.WriteError(w, err)
		return
	}
	name := strings.TrimSpace(req.Name)
	if name == "" {
		httpx.WriteError(w, httpx.NewValidationError(
			map[string]string{"name": "must not be blank"}, nil))
		return
	}
	if err := ValidateBands(req.Bands); err != nil {
		httpx.WriteError(w, err)
		return
	}

	bandsJSON, err := BandsToJSON(req.Bands)
	if err != nil {
		httpx.WriteError(w, err)
		return
	}

	userID := auth.UserIDFromContext(r.Context())
	row, err := h.queries.CreateCustomEQProfile(r.Context(), db.CreateCustomEQProfileParams{
		OwnerUserID: uuidToPg(userID),
		Name:        name,
		Bands:       bandsJSON,
	})
	if err != nil {
		slog.ErrorContext(r.Context(), "create eq profile failed", "error", err, "user_id", userID)
		httpx.WriteError(w, fmt.Errorf("create eq profile: %w", err))
		return
	}

	profileID, _ := uuid.FromBytes(row.ID.Bytes[:])
	slog.InfoContext(r.Context(), "custom eq profile created",
		"eq_profile_id", profileID, "user_id", userID)

	writeProfile(w, http.StatusCreated, row)
}

func (h *Handler) get(w http.ResponseWriter, r *http.Request) {
	profileID, err := parseIDParam(r, "id")
	if err != nil {
		httpx.WriteError(w, err)
		return
	}
	userID := auth.UserIDFromContext(r.Context())

	row, err := h.queries.GetAccessibleEQProfile(r.Context(), db.GetAccessibleEQProfileParams{
		ID:          uuidToPg(profileID),
		OwnerUserID: uuidToPg(userID),
	})
	if errors.Is(err, pgx.ErrNoRows) {
		httpx.WriteError(w, httpx.ErrNotFound)
		return
	}
	if err != nil {
		slog.ErrorContext(r.Context(), "get eq profile failed", "error", err, "user_id", userID)
		httpx.WriteError(w, fmt.Errorf("get eq profile: %w", err))
		return
	}
	writeProfile(w, http.StatusOK, row)
}

func (h *Handler) update(w http.ResponseWriter, r *http.Request) {
	profileID, err := parseIDParam(r, "id")
	if err != nil {
		httpx.WriteError(w, err)
		return
	}

	var req UpdateRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		httpx.WriteError(w, err)
		return
	}

	userID := auth.UserIDFromContext(r.Context())
	current, err := h.queries.GetAccessibleEQProfile(r.Context(), db.GetAccessibleEQProfileParams{
		ID:          uuidToPg(profileID),
		OwnerUserID: uuidToPg(userID),
	})
	if errors.Is(err, pgx.ErrNoRows) {
		httpx.WriteError(w, httpx.ErrNotFound)
		return
	}
	if err != nil {
		slog.ErrorContext(r.Context(), "get eq profile for update failed",
			"error", err, "user_id", userID)
		httpx.WriteError(w, fmt.Errorf("get eq profile: %w", err))
		return
	}
	if current.IsSystem {
		httpx.WriteError(w, httpx.ErrSystemPresetImmutable)
		return
	}

	name := current.Name
	if req.Name.Set && !req.Name.Null {
		trimmed := strings.TrimSpace(req.Name.Value)
		if n := len(trimmed); n < 1 || n > 100 {
			httpx.WriteError(w, httpx.NewValidationError(
				map[string]string{"name": "must be between 1 and 100 characters"}, nil))
			return
		}
		name = trimmed
	}

	bandsJSON := current.Bands
	if req.Bands.Set && !req.Bands.Null {
		if err := ValidateBands(req.Bands.Value); err != nil {
			httpx.WriteError(w, err)
			return
		}
		raw, err := BandsToJSON(req.Bands.Value)
		if err != nil {
			httpx.WriteError(w, err)
			return
		}
		bandsJSON = raw
	}

	updated, err := h.queries.UpdateCustomEQProfile(r.Context(), db.UpdateCustomEQProfileParams{
		ID:          uuidToPg(profileID),
		OwnerUserID: uuidToPg(userID),
		Name:        name,
		Bands:       bandsJSON,
	})
	if errors.Is(err, pgx.ErrNoRows) {
		// Lost-race fallback: someone deleted between SELECT and UPDATE.
		httpx.WriteError(w, httpx.ErrNotFound)
		return
	}
	if err != nil {
		slog.ErrorContext(r.Context(), "update eq profile failed",
			"error", err, "user_id", userID, "eq_profile_id", profileID)
		httpx.WriteError(w, fmt.Errorf("update eq profile: %w", err))
		return
	}
	writeProfile(w, http.StatusOK, updated)
}

func (h *Handler) delete(w http.ResponseWriter, r *http.Request) {
	profileID, err := parseIDParam(r, "id")
	if err != nil {
		httpx.WriteError(w, err)
		return
	}

	userID := auth.UserIDFromContext(r.Context())
	current, err := h.queries.GetAccessibleEQProfile(r.Context(), db.GetAccessibleEQProfileParams{
		ID:          uuidToPg(profileID),
		OwnerUserID: uuidToPg(userID),
	})
	if errors.Is(err, pgx.ErrNoRows) {
		httpx.WriteError(w, httpx.ErrNotFound)
		return
	}
	if err != nil {
		slog.ErrorContext(r.Context(), "get eq profile for delete failed",
			"error", err, "user_id", userID)
		httpx.WriteError(w, fmt.Errorf("get eq profile: %w", err))
		return
	}
	if current.IsSystem {
		httpx.WriteError(w, httpx.ErrSystemPresetImmutable)
		return
	}

	rows, err := h.queries.DeleteCustomEQProfile(r.Context(), db.DeleteCustomEQProfileParams{
		ID:          uuidToPg(profileID),
		OwnerUserID: uuidToPg(userID),
	})
	if err != nil {
		slog.ErrorContext(r.Context(), "delete eq profile failed",
			"error", err, "user_id", userID, "eq_profile_id", profileID)
		httpx.WriteError(w, fmt.Errorf("delete eq profile: %w", err))
		return
	}
	if rows == 0 {
		httpx.WriteError(w, httpx.ErrNotFound)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) fork(w http.ResponseWriter, r *http.Request) {
	sourceID, err := parseIDParam(r, "id")
	if err != nil {
		httpx.WriteError(w, err)
		return
	}

	var req ForkRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		httpx.WriteError(w, err)
		return
	}
	name := strings.TrimSpace(req.Name)
	if name == "" {
		httpx.WriteError(w, httpx.NewValidationError(
			map[string]string{"name": "must not be blank"}, nil))
		return
	}
	if err := ValidateBands(req.Bands); err != nil {
		httpx.WriteError(w, err)
		return
	}

	userID := auth.UserIDFromContext(r.Context())
	row, err := Fork(r.Context(), h.queries, sourceID, userID, name, req.Bands)
	if err != nil {
		if !errors.Is(err, httpx.ErrNotFound) && !errors.Is(err, httpx.ErrNotASystemPreset) {
			slog.ErrorContext(r.Context(), "fork eq profile failed",
				"error", err, "user_id", userID, "source_id", sourceID)
		}
		httpx.WriteError(w, err)
		return
	}

	profileID, _ := uuid.FromBytes(row.ID.Bytes[:])
	slog.InfoContext(r.Context(), "custom eq profile created",
		"eq_profile_id", profileID, "user_id", userID, "forked_from", sourceID)
	writeProfile(w, http.StatusCreated, row)
}

// writeProfile converts a db.EqProfile and writes it as JSON, mapping
// marshal errors to the standard error response.
func writeProfile(w http.ResponseWriter, status int, row db.EqProfile) {
	resp, err := ToResponse(row)
	if err != nil {
		httpx.WriteError(w, err)
		return
	}
	httpx.WriteJSON(w, status, resp)
}

func parseIDParam(r *http.Request, name string) (uuid.UUID, error) {
	id, err := uuid.Parse(chi.URLParam(r, name))
	if err != nil {
		return uuid.Nil, httpx.NewValidationError(
			map[string]string{name: "must be a valid UUID"}, err)
	}
	return id, nil
}

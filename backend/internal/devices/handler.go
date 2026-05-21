package devices

import (
	"errors"
	"fmt"
	"log/slog"
	mathrand "math/rand/v2"
	"net/http"
	"strings"

	"github.com/ffk00/iyte-hci-vespin/backend/internal/auth"
	"github.com/ffk00/iyte-hci-vespin/backend/internal/db"
	"github.com/ffk00/iyte-hci-vespin/backend/internal/httpx"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

type Handler struct {
	queries     *db.Queries
	defaultEQID uuid.UUID
}

func NewHandler(q *db.Queries, defaultEQID uuid.UUID) *Handler {
	return &Handler{queries: q, defaultEQID: defaultEQID}
}

func (h *Handler) RegisterRoutes(r chi.Router) {
	r.Get("/", h.list)
	r.Post("/", h.create)
	r.Get("/{id}", h.get)
	r.Patch("/{id}", h.update)
	r.Delete("/{id}", h.delete)
}

func (h *Handler) list(w http.ResponseWriter, r *http.Request) {
	userID := auth.UserIDFromContext(r.Context())
	rows, err := h.queries.ListDevicesByUser(r.Context(), uuidToPg(userID))
	if err != nil {
		slog.ErrorContext(r.Context(), "list devices failed", "error", err, "user_id", userID)
		httpx.WriteError(w, fmt.Errorf("list devices: %w", err))
		return
	}
	httpx.WriteJSON(w, http.StatusOK, ToListResponse(rows))
}

func (h *Handler) create(w http.ResponseWriter, r *http.Request) {
	var req CreateRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		httpx.WriteError(w, err)
		return
	}

	userID := auth.UserIDFromContext(r.Context())
	name := strings.TrimSpace(req.Name)
	if name == "" {
		httpx.WriteError(w, httpx.NewValidationError(
			map[string]string{"name": "must not be blank"}, nil))
		return
	}

	device, err := h.queries.CreateDevice(r.Context(), db.CreateDeviceParams{
		UserID:            uuidToPg(userID),
		Name:              name,
		DeviceType:        req.DeviceType,
		FirmwareVersion:   "1.0.0",
		BatteryLevel:      int32(20 + mathrand.IntN(81)), // 20..100 inclusive
		IsConnected:       mathrand.IntN(2) == 1,
		ActiveEqProfileID: uuidToPg(h.defaultEQID),
	})
	if err != nil {
		slog.ErrorContext(r.Context(), "create device failed", "error", err, "user_id", userID)
		httpx.WriteError(w, fmt.Errorf("create device: %w", err))
		return
	}

	deviceID, _ := uuid.FromBytes(device.ID.Bytes[:])
	slog.InfoContext(r.Context(), "device created",
		"device_id", deviceID, "user_id", userID, "device_type", device.DeviceType)
	httpx.WriteJSON(w, http.StatusCreated, ToResponse(device))
}

func (h *Handler) get(w http.ResponseWriter, r *http.Request) {
	deviceID, err := parseIDParam(r, "id")
	if err != nil {
		httpx.WriteError(w, err)
		return
	}
	userID := auth.UserIDFromContext(r.Context())

	device, err := h.queries.GetDeviceByIDAndUser(r.Context(), db.GetDeviceByIDAndUserParams{
		ID:     uuidToPg(deviceID),
		UserID: uuidToPg(userID),
	})
	if errors.Is(err, pgx.ErrNoRows) {
		httpx.WriteError(w, httpx.ErrNotFound)
		return
	}
	if err != nil {
		slog.ErrorContext(r.Context(), "get device failed", "error", err, "user_id", userID)
		httpx.WriteError(w, fmt.Errorf("get device: %w", err))
		return
	}
	httpx.WriteJSON(w, http.StatusOK, ToResponse(device))
}

func (h *Handler) update(w http.ResponseWriter, r *http.Request) {
	deviceID, err := parseIDParam(r, "id")
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
	device, err := UpdateWithEQValidation(r.Context(), h.queries, deviceID, userID, req)
	if err != nil {
		if !errors.Is(err, httpx.ErrNotFound) &&
			!errors.Is(err, httpx.ErrInvalidEQProfileRef) {
			var ve *httpx.ValidationError
			if !errors.As(err, &ve) {
				slog.ErrorContext(r.Context(), "update device failed",
					"error", err, "user_id", userID, "device_id", deviceID)
			}
		}
		httpx.WriteError(w, err)
		return
	}
	httpx.WriteJSON(w, http.StatusOK, ToResponse(device))
}

func (h *Handler) delete(w http.ResponseWriter, r *http.Request) {
	deviceID, err := parseIDParam(r, "id")
	if err != nil {
		httpx.WriteError(w, err)
		return
	}
	userID := auth.UserIDFromContext(r.Context())

	rows, err := h.queries.DeleteDevice(r.Context(), db.DeleteDeviceParams{
		ID:     uuidToPg(deviceID),
		UserID: uuidToPg(userID),
	})
	if err != nil {
		slog.ErrorContext(r.Context(), "delete device failed",
			"error", err, "user_id", userID, "device_id", deviceID)
		httpx.WriteError(w, fmt.Errorf("delete device: %w", err))
		return
	}
	if rows == 0 {
		httpx.WriteError(w, httpx.ErrNotFound)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func parseIDParam(r *http.Request, name string) (uuid.UUID, error) {
	id, err := uuid.Parse(chi.URLParam(r, name))
	if err != nil {
		return uuid.Nil, httpx.NewValidationError(
			map[string]string{name: "must be a valid UUID"}, err)
	}
	return id, nil
}

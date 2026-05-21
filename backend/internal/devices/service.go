package devices

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/ffk00/iyte-hci-vespin/backend/internal/db"
	"github.com/ffk00/iyte-hci-vespin/backend/internal/httpx"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

// UpdateWithEQValidation applies a PATCH to a device row owned by userID,
// validating any referenced EQ profile against the per-user accessible set
// before writing. Omitted Optional fields preserve the current value; a
// `null` activeEqProfileId clears it.
func UpdateWithEQValidation(
	ctx context.Context,
	q *db.Queries,
	deviceID, userID uuid.UUID,
	req UpdateRequest,
) (db.Device, error) {
	current, err := q.GetDeviceByIDAndUser(ctx, db.GetDeviceByIDAndUserParams{
		ID:     uuidToPg(deviceID),
		UserID: uuidToPg(userID),
	})
	if errors.Is(err, pgx.ErrNoRows) {
		return db.Device{}, httpx.ErrNotFound
	}
	if err != nil {
		return db.Device{}, fmt.Errorf("get device: %w", err)
	}

	name := current.Name
	if req.Name.Set && !req.Name.Null {
		trimmed := strings.TrimSpace(req.Name.Value)
		if n := len(trimmed); n < 1 || n > 100 {
			return db.Device{}, httpx.NewValidationError(
				map[string]string{"name": "must be between 1 and 100 characters"}, nil)
		}
		name = trimmed
	}

	activeEQ := current.ActiveEqProfileID
	if req.ActiveEqProfileID.Set {
		if req.ActiveEqProfileID.Null {
			activeEQ = pgtype.UUID{Valid: false}
		} else {
			if _, err := q.GetAccessibleEQProfile(ctx, db.GetAccessibleEQProfileParams{
				ID:          uuidToPg(req.ActiveEqProfileID.Value),
				OwnerUserID: uuidToPg(userID),
			}); errors.Is(err, pgx.ErrNoRows) {
				return db.Device{}, httpx.ErrInvalidEQProfileRef
			} else if err != nil {
				return db.Device{}, fmt.Errorf("validate eq profile: %w", err)
			}
			activeEQ = uuidToPg(req.ActiveEqProfileID.Value)
		}
	}

	updated, err := q.UpdateDevice(ctx, db.UpdateDeviceParams{
		ID:                uuidToPg(deviceID),
		UserID:            uuidToPg(userID),
		Name:              name,
		ActiveEqProfileID: activeEQ,
	})
	if errors.Is(err, pgx.ErrNoRows) {
		return db.Device{}, httpx.ErrNotFound
	}
	if err != nil {
		return db.Device{}, fmt.Errorf("update device: %w", err)
	}
	return updated, nil
}

func uuidToPg(id uuid.UUID) pgtype.UUID {
	return pgtype.UUID{Bytes: id, Valid: true}
}

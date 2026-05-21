package eqprofiles

import (
	"context"
	"errors"
	"fmt"

	"github.com/ffk00/iyte-hci-vespin/backend/internal/db"
	"github.com/ffk00/iyte-hci-vespin/backend/internal/httpx"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

// Fork creates a new custom EQ profile owned by userID, based on the bands
// the caller supplied. The source must be a system preset accessible to the
// caller; forking a custom profile returns ErrNotASystemPreset.
func Fork(
	ctx context.Context,
	q *db.Queries,
	sourceID, userID uuid.UUID,
	name string,
	bands Bands,
) (db.EqProfile, error) {
	source, err := q.GetAccessibleEQProfile(ctx, db.GetAccessibleEQProfileParams{
		ID:          uuidToPg(sourceID),
		OwnerUserID: uuidToPg(userID),
	})
	if errors.Is(err, pgx.ErrNoRows) {
		return db.EqProfile{}, httpx.ErrNotFound
	}
	if err != nil {
		return db.EqProfile{}, fmt.Errorf("get source profile: %w", err)
	}

	if !source.IsSystem {
		return db.EqProfile{}, httpx.ErrNotASystemPreset
	}

	bandsJSON, err := BandsToJSON(bands)
	if err != nil {
		return db.EqProfile{}, err
	}

	created, err := q.CreateCustomEQProfile(ctx, db.CreateCustomEQProfileParams{
		OwnerUserID: uuidToPg(userID),
		Name:        name,
		Bands:       bandsJSON,
	})
	if err != nil {
		return db.EqProfile{}, fmt.Errorf("create forked profile: %w", err)
	}
	return created, nil
}

func uuidToPg(id uuid.UUID) pgtype.UUID {
	return pgtype.UUID{Bytes: id, Valid: true}
}

package eqprofiles

import (
	"context"
	"errors"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"testing"

	"github.com/ffk00/iyte-hci-vespin/backend/internal/db"
	"github.com/ffk00/iyte-hci-vespin/backend/internal/httpx"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
)

// Fork tests need a real Postgres. Set TEST_DATABASE_URL to a clean
// (or reusable) database and run:
//
//	TEST_DATABASE_URL=postgres://... go test ./internal/eqprofiles/...
//
// Without TEST_DATABASE_URL these tests skip. Migrations are applied
// directly from internal/db/migrations on first connect; use a throwaway
// DB because idempotency across runs is not guaranteed.
func openTestPool(t *testing.T) *pgxpool.Pool {
	t.Helper()
	url := os.Getenv("TEST_DATABASE_URL")
	if url == "" {
		t.Skip("TEST_DATABASE_URL not set; skipping integration test")
	}

	ctx := context.Background()
	pool, err := pgxpool.New(ctx, url)
	if err != nil {
		t.Fatalf("connect: %v", err)
	}
	t.Cleanup(pool.Close)

	if err := runMigrations(ctx, pool); err != nil {
		t.Fatalf("migrate: %v", err)
	}
	return pool
}

func runMigrations(ctx context.Context, pool *pgxpool.Pool) error {
	dir, err := findMigrationsDir()
	if err != nil {
		return err
	}
	entries, err := os.ReadDir(dir)
	if err != nil {
		return err
	}
	var ups []string
	for _, e := range entries {
		if strings.HasSuffix(e.Name(), ".up.sql") {
			ups = append(ups, e.Name())
		}
	}
	sort.Strings(ups)
	for _, name := range ups {
		body, err := os.ReadFile(filepath.Join(dir, name))
		if err != nil {
			return err
		}
		if _, err := pool.Exec(ctx, string(body)); err != nil {
			return err
		}
	}
	return nil
}

func findMigrationsDir() (string, error) {
	wd, err := os.Getwd()
	if err != nil {
		return "", err
	}
	dir := wd
	for range 6 {
		candidate := filepath.Join(dir, "internal", "db", "migrations")
		if info, err := os.Stat(candidate); err == nil && info.IsDir() {
			return candidate, nil
		}
		parent := filepath.Dir(dir)
		if parent == dir {
			break
		}
		dir = parent
	}
	return "", errors.New("could not locate internal/db/migrations from " + wd)
}

func makeGuest(t *testing.T, q *db.Queries) uuid.UUID {
	t.Helper()
	row, err := q.CreateGuestUser(context.Background())
	if err != nil {
		t.Fatalf("CreateGuestUser: %v", err)
	}
	id, _ := uuid.FromBytes(row.ID.Bytes[:])
	return id
}

// flatPresetID returns the seeded "Flat" system preset's UUID via the same
// query the API uses to bootstrap default-EQ wiring.
func flatPresetID(t *testing.T, q *db.Queries) uuid.UUID {
	t.Helper()
	row, err := q.GetDefaultEQProfile(context.Background())
	if err != nil {
		t.Fatalf("GetDefaultEQProfile: %v", err)
	}
	id, _ := uuid.FromBytes(row.ID.Bytes[:])
	return id
}

func sampleBands() Bands {
	return Bands{SubBass: 2, Bass: 3, Mid: -1, Treble: 1, Presence: 0}
}

func TestForkHappyPath(t *testing.T) {
	pool := openTestPool(t)
	q := db.New(pool)
	ctx := context.Background()

	userID := makeGuest(t, q)
	sourceID := flatPresetID(t, q)
	bands := sampleBands()

	forked, err := Fork(ctx, q, sourceID, userID, "My Flat", bands)
	if err != nil {
		t.Fatalf("Fork: %v", err)
	}

	if forked.IsSystem {
		t.Errorf("IsSystem: got true, want false")
	}
	if !forked.OwnerUserID.Valid {
		t.Fatal("OwnerUserID: expected non-null on custom profile")
	}
	ownerID, _ := uuid.FromBytes(forked.OwnerUserID.Bytes[:])
	if ownerID != userID {
		t.Errorf("OwnerUserID: got %v, want %v", ownerID, userID)
	}
	if forked.Name != "My Flat" {
		t.Errorf("Name: got %q, want %q", forked.Name, "My Flat")
	}
	gotBands, err := BandsFromJSON(forked.Bands)
	if err != nil {
		t.Fatalf("BandsFromJSON: %v", err)
	}
	if gotBands != bands {
		t.Errorf("Bands: got %+v, want %+v", gotBands, bands)
	}

	forkedID, _ := uuid.FromBytes(forked.ID.Bytes[:])
	if forkedID == sourceID {
		t.Error("forked ID must differ from source")
	}

	// Source preset must be unchanged.
	source, err := q.GetAccessibleEQProfile(ctx, db.GetAccessibleEQProfileParams{
		ID:          pgtype.UUID{Bytes: sourceID, Valid: true},
		OwnerUserID: pgtype.UUID{Bytes: userID, Valid: true},
	})
	if err != nil {
		t.Fatalf("re-read source: %v", err)
	}
	if !source.IsSystem {
		t.Error("source IsSystem: got false after fork, want true")
	}
	if source.Name != "Flat" {
		t.Errorf("source Name: got %q, want %q", source.Name, "Flat")
	}
}

func TestForkRejectsCustomProfile(t *testing.T) {
	pool := openTestPool(t)
	q := db.New(pool)
	ctx := context.Background()

	userID := makeGuest(t, q)

	bandsJSON, err := BandsToJSON(sampleBands())
	if err != nil {
		t.Fatalf("BandsToJSON: %v", err)
	}
	custom, err := q.CreateCustomEQProfile(ctx, db.CreateCustomEQProfileParams{
		OwnerUserID: pgtype.UUID{Bytes: userID, Valid: true},
		Name:        "My Custom",
		Bands:       bandsJSON,
	})
	if err != nil {
		t.Fatalf("CreateCustomEQProfile: %v", err)
	}
	customID, _ := uuid.FromBytes(custom.ID.Bytes[:])

	_, err = Fork(ctx, q, customID, userID, "Fork of Custom", sampleBands())
	if !errors.Is(err, httpx.ErrNotASystemPreset) {
		t.Fatalf("Fork on custom: expected ErrNotASystemPreset, got %v", err)
	}
}

func TestForkAcrossUsers(t *testing.T) {
	pool := openTestPool(t)
	q := db.New(pool)
	ctx := context.Background()

	otherUser := makeGuest(t, q)
	caller := makeGuest(t, q)
	if otherUser == caller {
		t.Fatal("two guests should have different ids")
	}

	sourceID := flatPresetID(t, q)

	// System presets have no owner; any authenticated user can fork them.
	forked, err := Fork(ctx, q, sourceID, caller, "Caller's Flat", sampleBands())
	if err != nil {
		t.Fatalf("Fork as caller: %v", err)
	}

	ownerID, _ := uuid.FromBytes(forked.OwnerUserID.Bytes[:])
	if ownerID != caller {
		t.Errorf("OwnerUserID: got %v, want %v (caller)", ownerID, caller)
	}
}

func TestForkMissingSourceReturnsNotFound(t *testing.T) {
	pool := openTestPool(t)
	q := db.New(pool)
	ctx := context.Background()

	userID := makeGuest(t, q)
	bogus := uuid.New()

	_, err := Fork(ctx, q, bogus, userID, "Nope", sampleBands())
	if !errors.Is(err, httpx.ErrNotFound) {
		t.Fatalf("Fork missing source: expected ErrNotFound, got %v", err)
	}
}

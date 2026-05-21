package eqprofiles

import (
	"encoding/json"
	"errors"
	"strings"
	"testing"

	"github.com/ffk00/iyte-hci-vespin/backend/internal/httpx"
)

func TestBandsUnmarshalValid(t *testing.T) {
	raw := []byte(`{"subBass":1,"bass":2,"mid":-3,"treble":4,"presence":-5}`)

	var b Bands
	if err := json.Unmarshal(raw, &b); err != nil {
		t.Fatalf("Unmarshal: %v", err)
	}
	want := Bands{SubBass: 1, Bass: 2, Mid: -3, Treble: 4, Presence: -5}
	if b != want {
		t.Errorf("got %+v, want %+v", b, want)
	}
}

func TestBandsUnmarshalRejectsMissingField(t *testing.T) {
	// presence is missing.
	raw := []byte(`{"subBass":0,"bass":0,"mid":0,"treble":0}`)

	var b Bands
	err := json.Unmarshal(raw, &b)
	if err == nil {
		t.Fatal("expected error for missing 'presence', got nil")
	}
	if !strings.Contains(err.Error(), `missing required field "presence"`) {
		t.Errorf("error should mention missing presence; got: %v", err)
	}
}

func TestBandsUnmarshalRejectsUnknownField(t *testing.T) {
	raw := []byte(`{"subBass":0,"bass":0,"mid":0,"treble":0,"presence":0,"superBass":9}`)

	var b Bands
	err := json.Unmarshal(raw, &b)
	if err == nil {
		t.Fatal("expected error for unknown field 'superBass', got nil")
	}
	if !strings.Contains(err.Error(), `unknown field "superBass"`) {
		t.Errorf("error should mention unknown field; got: %v", err)
	}
}

func TestBandsUnmarshalRejectsNonInteger(t *testing.T) {
	raw := []byte(`{"subBass":0,"bass":0,"mid":0,"treble":"high","presence":0}`)

	var b Bands
	err := json.Unmarshal(raw, &b)
	if err == nil {
		t.Fatal("expected error for string in 'treble', got nil")
	}
}

func TestValidateBandsAcceptsBoundary(t *testing.T) {
	cases := []Bands{
		{SubBass: -12, Bass: -12, Mid: -12, Treble: -12, Presence: -12},
		{SubBass: 12, Bass: 12, Mid: 12, Treble: 12, Presence: 12},
		{SubBass: 0, Bass: 0, Mid: 0, Treble: 0, Presence: 0},
	}
	for _, b := range cases {
		if err := ValidateBands(b); err != nil {
			t.Errorf("ValidateBands(%+v): want nil, got %v", b, err)
		}
	}
}

func TestValidateBandsRejectsOutOfRange(t *testing.T) {
	// treble=13 is one above the maximum.
	b := Bands{SubBass: 0, Bass: 0, Mid: 0, Treble: 13, Presence: 0}

	err := ValidateBands(b)
	if err == nil {
		t.Fatal("expected error for treble=13, got nil")
	}
	var ve *httpx.ValidationError
	if !errors.As(err, &ve) {
		t.Fatalf("error should be *ValidationError, got %T (%v)", err, err)
	}
	got, ok := ve.Fields["bands.treble"]
	if !ok {
		t.Fatalf("expected fields[\"bands.treble\"]; got %+v", ve.Fields)
	}
	if !strings.Contains(got, "-12 and 12") {
		t.Errorf("error text should mention the range; got %q", got)
	}
}

func TestValidateBandsReportsAllOutOfRangeFields(t *testing.T) {
	b := Bands{SubBass: -13, Bass: 0, Mid: 0, Treble: 13, Presence: 0}

	err := ValidateBands(b)
	if err == nil {
		t.Fatal("expected error, got nil")
	}
	var ve *httpx.ValidationError
	if !errors.As(err, &ve) {
		t.Fatalf("error should be *ValidationError, got %T", err)
	}
	for _, key := range []string{"bands.subBass", "bands.treble"} {
		if _, ok := ve.Fields[key]; !ok {
			t.Errorf("expected fields[%q] in error; got %+v", key, ve.Fields)
		}
	}
	if _, ok := ve.Fields["bands.bass"]; ok {
		t.Errorf("did not expect fields[\"bands.bass\"] (value is in range); got %+v", ve.Fields)
	}
}

// Roundtripping through BandsToJSON / BandsFromJSON must produce the same
// struct — including the seeded "all zero" preset shape used by the Flat
// migration.
func TestBandsRoundTrip(t *testing.T) {
	original := Bands{SubBass: 3, Bass: -2, Mid: 0, Treble: 5, Presence: -1}

	raw, err := BandsToJSON(original)
	if err != nil {
		t.Fatalf("BandsToJSON: %v", err)
	}
	got, err := BandsFromJSON(raw)
	if err != nil {
		t.Fatalf("BandsFromJSON: %v", err)
	}
	if got != original {
		t.Errorf("roundtrip: got %+v, want %+v", got, original)
	}
}

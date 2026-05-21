package eqprofiles

import (
	"encoding/json"
	"fmt"

	"github.com/ffk00/iyte-hci-vespin/backend/internal/httpx"
)

type Bands struct {
	SubBass  int `json:"subBass"  validate:"min=-12,max=12"`
	Bass     int `json:"bass"     validate:"min=-12,max=12"`
	Mid      int `json:"mid"      validate:"min=-12,max=12"`
	Treble   int `json:"treble"   validate:"min=-12,max=12"`
	Presence int `json:"presence" validate:"min=-12,max=12"`
}

// bandKeys lists the JSON keys the OpenAPI EQBands schema declares as
// required. Order matters: missing-key errors are reported in this order
// so the message is deterministic.
var bandKeys = []string{"subBass", "bass", "mid", "treble", "presence"}

// UnmarshalJSON enforces the contract from the EQBands schema: exactly the
// five band keys must be present, with integer values. Missing keys, unknown
// keys, and non-integer values are all rejected. Range checking (-12..12)
// stays in ValidateBands so the violations can be surfaced with structured
// per-band field paths.
func (b *Bands) UnmarshalJSON(data []byte) error {
	var raw map[string]json.RawMessage
	if err := json.Unmarshal(data, &raw); err != nil {
		return fmt.Errorf("bands: %w", err)
	}

	seen := make(map[string]bool, len(bandKeys))
	for _, k := range bandKeys {
		seen[k] = false
	}
	for k := range raw {
		if _, expected := seen[k]; !expected {
			return fmt.Errorf("bands: unknown field %q", k)
		}
		seen[k] = true
	}
	for _, k := range bandKeys {
		if !seen[k] {
			return fmt.Errorf("bands: missing required field %q", k)
		}
	}

	// shadow drops Bands's UnmarshalJSON so encoding/json walks the struct
	// tags normally and surfaces a type error if any band is non-integer.
	type shadow Bands
	var s shadow
	if err := json.Unmarshal(data, &s); err != nil {
		return fmt.Errorf("bands: %w", err)
	}
	*b = Bands(s)
	return nil
}

func BandsToJSON(b Bands) (json.RawMessage, error) {
	raw, err := json.Marshal(b)
	if err != nil {
		return nil, fmt.Errorf("marshal bands: %w", err)
	}
	return raw, nil
}

func BandsFromJSON(raw json.RawMessage) (Bands, error) {
	var b Bands
	if err := json.Unmarshal(raw, &b); err != nil {
		return Bands{}, fmt.Errorf("unmarshal bands: %w", err)
	}
	return b, nil
}

// ValidateBands enforces the -12..12 dB range per band. Returns nil when
// valid, a *httpx.ValidationError keyed by "bands.<band>" when not.
func ValidateBands(b Bands) error {
	fields := map[string]string{}
	check := func(name string, v int) {
		if v < -12 || v > 12 {
			fields["bands."+name] = "must be between -12 and 12"
		}
	}
	check("subBass", b.SubBass)
	check("bass", b.Bass)
	check("mid", b.Mid)
	check("treble", b.Treble)
	check("presence", b.Presence)

	if len(fields) > 0 {
		return httpx.NewValidationError(fields, nil)
	}
	return nil
}

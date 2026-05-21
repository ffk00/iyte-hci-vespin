package devices

import (
	"github.com/ffk00/iyte-hci-vespin/backend/internal/db"
	"github.com/ffk00/iyte-hci-vespin/backend/internal/httpx"
	"github.com/google/uuid"
)

type CreateRequest struct {
	Name       string `json:"name"       validate:"required,min=1,max=100"`
	DeviceType string `json:"deviceType" validate:"required,oneof=vespin_classic vespin_mini vespin_pro"`
}

// UpdateRequest is the PATCH body. Both fields are optional. activeEqProfileId
// is tri-state: omitted = keep, null = clear, uuid = set (validated against
// accessible profiles before write).
type UpdateRequest struct {
	Name              httpx.Optional[string]    `json:"name"`
	ActiveEqProfileID httpx.Optional[uuid.UUID] `json:"activeEqProfileId"`
}

type Response struct {
	ID                uuid.UUID  `json:"id"`
	Name              string     `json:"name"`
	DeviceType        string     `json:"deviceType"`
	FirmwareVersion   string     `json:"firmwareVersion"`
	BatteryLevel      int        `json:"batteryLevel"`
	IsConnected       bool       `json:"isConnected"`
	ActiveEqProfileID *uuid.UUID `json:"activeEqProfileId"`
	PairedAt          string     `json:"pairedAt"`
	CreatedAt         string     `json:"createdAt"`
}

func ToResponse(d db.Device) Response {
	resp := Response{
		Name:            d.Name,
		DeviceType:      d.DeviceType,
		FirmwareVersion: d.FirmwareVersion,
		BatteryLevel:    int(d.BatteryLevel),
		IsConnected:     d.IsConnected,
		PairedAt:        d.PairedAt.Time.UTC().Format("2006-01-02T15:04:05Z07:00"),
		CreatedAt:       d.CreatedAt.Time.UTC().Format("2006-01-02T15:04:05Z07:00"),
	}
	resp.ID, _ = uuid.FromBytes(d.ID.Bytes[:])
	if d.ActiveEqProfileID.Valid {
		v, _ := uuid.FromBytes(d.ActiveEqProfileID.Bytes[:])
		resp.ActiveEqProfileID = &v
	}
	return resp
}

func ToListResponse(rows []db.Device) []Response {
	out := make([]Response, len(rows))
	for i, row := range rows {
		out[i] = ToResponse(row)
	}
	return out
}

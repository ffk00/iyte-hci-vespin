package eqprofiles

import (
	"github.com/ffk00/iyte-hci-vespin/backend/internal/db"
	"github.com/ffk00/iyte-hci-vespin/backend/internal/httpx"
	"github.com/google/uuid"
)

type CreateRequest struct {
	Name  string `json:"name"  validate:"required,min=1,max=100"`
	Bands Bands  `json:"bands" validate:"required"`
}

// UpdateRequest is the PATCH body. Both fields are optional. Empty body is
// valid (returns the current row unchanged).
type UpdateRequest struct {
	Name  httpx.Optional[string] `json:"name"`
	Bands httpx.Optional[Bands]  `json:"bands"`
}

type ForkRequest struct {
	Name  string `json:"name"  validate:"required,min=1,max=100"`
	Bands Bands  `json:"bands" validate:"required"`
}

type Response struct {
	ID        uuid.UUID `json:"id"`
	Name      string    `json:"name"`
	IsSystem  bool      `json:"isSystem"`
	Bands     Bands     `json:"bands"`
	CreatedAt string    `json:"createdAt"`
}

func ToResponse(p db.EqProfile) (Response, error) {
	bands, err := BandsFromJSON(p.Bands)
	if err != nil {
		return Response{}, err
	}
	resp := Response{
		Name:      p.Name,
		IsSystem:  p.IsSystem,
		Bands:     bands,
		CreatedAt: p.CreatedAt.Time.UTC().Format("2006-01-02T15:04:05Z07:00"),
	}
	resp.ID, _ = uuid.FromBytes(p.ID.Bytes[:])
	return resp, nil
}

func ToListResponse(rows []db.EqProfile) ([]Response, error) {
	out := make([]Response, len(rows))
	for i, row := range rows {
		r, err := ToResponse(row)
		if err != nil {
			return nil, err
		}
		out[i] = r
	}
	return out, nil
}

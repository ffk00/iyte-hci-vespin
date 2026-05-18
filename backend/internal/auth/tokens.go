package auth

import (
	"fmt"
	"time"

	"github.com/ffk00/iyte-hci-vespin/backend/internal/httpx"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

const tokenTTL = 30 * 24 * time.Hour

type Tokens struct {
	secret []byte
}

type Claims struct {
	UserID uuid.UUID
	Role   string
}

func NewTokens(secret string) *Tokens {
	return &Tokens{secret: []byte(secret)}
}

func (t *Tokens) Sign(userID uuid.UUID, role string) (string, error) {
	if !validRole(role) {
		return "", fmt.Errorf("sign token: invalid role %q", role)
	}

	now := time.Now().UTC()
	claims := jwt.MapClaims{
		"sub":  userID.String(),
		"role": role,
		"iat":  now.Unix(),
		"exp":  now.Add(tokenTTL).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString(t.secret)
	if err != nil {
		return "", fmt.Errorf("sign token: %w", err)
	}

	return signed, nil
}

func (t *Tokens) Verify(tokenValue string) (Claims, error) {
	parsed, err := jwt.ParseWithClaims(
		tokenValue,
		jwt.MapClaims{},
		func(token *jwt.Token) (any, error) {
			if token.Method != jwt.SigningMethodHS256 {
				return nil, fmt.Errorf("unexpected signing method")
			}
			return t.secret, nil
		},
		jwt.WithExpirationRequired(),
		jwt.WithValidMethods([]string{jwt.SigningMethodHS256.Alg()}),
	)
	if err != nil {
		return Claims{}, fmt.Errorf("%w: %v", httpx.ErrUnauthorized, err)
	}

	claims, ok := parsed.Claims.(jwt.MapClaims)
	if !ok || !parsed.Valid {
		return Claims{}, httpx.ErrUnauthorized
	}

	sub, err := claims.GetSubject()
	if err != nil {
		return Claims{}, fmt.Errorf("%w: missing subject", httpx.ErrUnauthorized)
	}

	userID, err := uuid.Parse(sub)
	if err != nil {
		return Claims{}, fmt.Errorf("%w: invalid subject", httpx.ErrUnauthorized)
	}

	role, ok := claims["role"].(string)
	if !ok || !validRole(role) {
		return Claims{}, fmt.Errorf("%w: invalid role", httpx.ErrUnauthorized)
	}

	return Claims{UserID: userID, Role: role}, nil
}

func validRole(role string) bool {
	return role == RoleGuest || role == RoleRegistered
}

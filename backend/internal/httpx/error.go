package httpx

import (
	"errors"
	"net/http"

	"github.com/jackc/pgx/v5"
)

var (
	ErrValidationFailed        = errors.New("validation failed")
	ErrUnauthorized            = errors.New("unauthorized")
	ErrForbidden               = errors.New("forbidden")
	ErrNotFound                = errors.New("not found")
	ErrConflict                = errors.New("conflict")
	ErrEmailTaken              = errors.New("email taken")
	ErrAlreadyRegistered       = errors.New("already registered")
	ErrInvalidCredentials      = errors.New("invalid credentials")
	ErrSystemPresetImmutable   = errors.New("system preset immutable")
	ErrGuestEndpointForbidden  = errors.New("guest endpoint forbidden")
	ErrInvalidEQProfileRef     = errors.New("invalid eq profile reference")
	ErrNotASystemPreset        = errors.New("not a system preset")
	ErrInvalidDeviceRef        = errors.New("invalid device reference")
	ErrInvalidStatusTransition = errors.New("invalid status transition")
	ErrDeviceAlreadyInSession  = errors.New("device already in session")
)

type ErrorResponse struct {
	Error ErrorBody `json:"error"`
}

type ErrorBody struct {
	Code    string `json:"code"`
	Message string `json:"message"`
	Details any    `json:"details,omitempty"`
}

type ValidationError struct {
	Fields map[string]string
	Cause  error
}

func NewValidationError(fields map[string]string, cause error) *ValidationError {
	return &ValidationError{Fields: fields, Cause: cause}
}

func (e *ValidationError) Error() string {
	if e.Cause != nil {
		return e.Cause.Error()
	}
	return ErrValidationFailed.Error()
}

func (e *ValidationError) Unwrap() error {
	return e.Cause
}

func WriteError(w http.ResponseWriter, err error) {
	status, code, message, details := mapError(err)
	WriteJSON(w, status, ErrorResponse{
		Error: ErrorBody{
			Code:    code,
			Message: message,
			Details: details,
		},
	})
}

func mapError(err error) (int, string, string, any) {
	var validationErr *ValidationError
	if errors.As(err, &validationErr) {
		return http.StatusBadRequest, "validation_failed", "Request validation failed.", validationDetails(validationErr)
	}

	switch {
	case errors.Is(err, ErrValidationFailed):
		return http.StatusBadRequest, "validation_failed", "Request validation failed.", nil
	case errors.Is(err, ErrUnauthorized):
		return http.StatusUnauthorized, "unauthorized", "Authentication required.", nil
	case errors.Is(err, ErrForbidden):
		return http.StatusForbidden, "forbidden", "Forbidden.", nil
	case errors.Is(err, ErrGuestEndpointForbidden):
		return http.StatusForbidden, "guest_endpoint_forbidden", "This endpoint is only available to registered users.", nil
	case errors.Is(err, ErrSystemPresetImmutable):
		return http.StatusForbidden, "system_preset_immutable", "System presets cannot be modified. Fork to a custom profile instead.", nil
	case errors.Is(err, ErrNotFound), errors.Is(err, pgx.ErrNoRows):
		return http.StatusNotFound, "not_found", "Resource not found.", nil
	case errors.Is(err, ErrInvalidCredentials):
		return http.StatusUnauthorized, "invalid_credentials", "Email or password is incorrect.", nil
	case errors.Is(err, ErrEmailTaken):
		return http.StatusConflict, "email_taken", "An account with this email already exists.", nil
	case errors.Is(err, ErrAlreadyRegistered):
		return http.StatusConflict, "already_registered", "This account is already registered.", nil
	case errors.Is(err, ErrConflict):
		return http.StatusConflict, "conflict", "Resource conflict.", nil
	case errors.Is(err, ErrInvalidEQProfileRef):
		return http.StatusBadRequest, "invalid_eq_profile_reference", "Referenced EQ profile does not exist or is not accessible.", nil
	case errors.Is(err, ErrNotASystemPreset):
		return http.StatusBadRequest, "not_a_system_preset", "Fork target must be a system preset.", nil
	case errors.Is(err, ErrInvalidDeviceRef):
		return http.StatusBadRequest, "invalid_device_reference", "One or more referenced devices do not exist or are not accessible.", nil
	case errors.Is(err, ErrInvalidStatusTransition):
		return http.StatusBadRequest, "invalid_status_transition", "Invalid status transition.", nil
	case errors.Is(err, ErrDeviceAlreadyInSession):
		return http.StatusConflict, "device_already_in_session", "This device is already part of the session.", nil
	default:
		return http.StatusInternalServerError, "internal_error", "An unexpected error occurred.", nil
	}
}

func validationDetails(err *ValidationError) any {
	if len(err.Fields) == 0 {
		return nil
	}
	return map[string]any{"fields": err.Fields}
}

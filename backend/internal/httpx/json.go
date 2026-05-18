package httpx

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"reflect"
	"strings"

	"github.com/go-playground/validator/v10"
)

const maxJSONBodyBytes = 1 << 20

var validate = validator.New(validator.WithRequiredStructEnabled())

func WriteJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if value == nil {
		return
	}
	_ = json.NewEncoder(w).Encode(value)
}

func DecodeJSON(r *http.Request, dst any) error {
	if r.Body == nil {
		return NewValidationError(nil, errors.New("request body is required"))
	}

	dec := json.NewDecoder(io.LimitReader(r.Body, maxJSONBodyBytes))
	dec.DisallowUnknownFields()

	if err := dec.Decode(dst); err != nil {
		return NewValidationError(nil, fmt.Errorf("decode json: %w", err))
	}

	var extra struct{}
	if err := dec.Decode(&extra); !errors.Is(err, io.EOF) {
		return NewValidationError(nil, errors.New("request body must contain a single JSON value"))
	}

	if err := validate.Struct(dst); err != nil {
		var validationErrs validator.ValidationErrors
		if errors.As(err, &validationErrs) {
			return NewValidationError(validationFields(dst, validationErrs), err)
		}
		return NewValidationError(nil, err)
	}

	return nil
}

func validationFields(dst any, validationErrs validator.ValidationErrors) map[string]string {
	fields := make(map[string]string, len(validationErrs))
	for _, fieldErr := range validationErrs {
		fields[jsonFieldName(dst, fieldErr.StructField())] = validationMessage(fieldErr)
	}
	return fields
}

func jsonFieldName(dst any, structField string) string {
	t := reflect.TypeOf(dst)
	if t.Kind() == reflect.Pointer {
		t = t.Elem()
	}
	if t.Kind() != reflect.Struct {
		return structField
	}

	field, ok := t.FieldByName(structField)
	if !ok {
		return structField
	}

	name := strings.Split(field.Tag.Get("json"), ",")[0]
	if name == "" || name == "-" {
		return structField
	}
	return name
}

func validationMessage(fieldErr validator.FieldError) string {
	switch fieldErr.Tag() {
	case "required":
		return "is required"
	case "email":
		return "must be a valid email address"
	case "min":
		return "must be at least " + fieldErr.Param()
	case "max":
		return "must be at most " + fieldErr.Param()
	case "oneof":
		return "must be one of: " + fieldErr.Param()
	default:
		return "is invalid"
	}
}

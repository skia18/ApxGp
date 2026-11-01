package httpapi

import (
	"encoding/json"
	"log/slog"
	"net/http"
)

type ErrorResponse struct {
	Error APIError `json:"error"`
}

type APIError struct {
	Code      string `json:"code"`
	Message   string `json:"message"`
	RequestID string `json:"requestId,omitempty"`
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(payload); err != nil {
		slog.Error("encode HTTP response", "error", err)
	}
}

func writeError(w http.ResponseWriter, r *http.Request, status int, code, message string) {
	writeJSON(w, status, ErrorResponse{Error: APIError{
		Code:      code,
		Message:   message,
		RequestID: requestIDFromContext(r.Context()),
	}})
}

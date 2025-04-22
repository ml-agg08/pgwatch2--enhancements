package webserver

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

func (Server *WebUIServer) handleMetrics(w http.ResponseWriter, r *http.Request) {
	var (
		err    error
		params []byte
		res    string
	)

	defer func() {
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
	}()

	switch r.Method {
	case http.MethodGet:
		// return stored metrics
		if res, err = Server.GetMetrics(); err != nil {
			return
		}
		_, err = w.Write([]byte(res))

	case http.MethodPost:
		// add new stored metric
		if params, err = io.ReadAll(r.Body); err != nil {
			return
		}
		err = Server.UpdateMetric(r.URL.Query().Get("name"), params)

	case http.MethodDelete:
		// delete stored metric
		err = Server.DeleteMetric(r.URL.Query().Get("name"))

	case http.MethodOptions:
		w.Header().Set("Allow", "GET, POST, DELETE, OPTIONS")
		w.WriteHeader(http.StatusNoContent)

	default:
		w.Header().Set("Allow", "GET, POST, DELETE, OPTIONS")
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
	}
}

func (Server *WebUIServer) handleLatestMetrics(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.Header().Set("Allow", "GET")
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	dbname := r.URL.Query().Get("dbname")
	if dbname == "" {
		http.Error(w, "dbname parameter is required", http.StatusBadRequest)
		return
	}

	// Get the latest metrics from the database
	latestMetrics, err := Server.GetLatestMetrics(dbname)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_, _ = w.Write([]byte(latestMetrics))
}

// handleBatchLatestMetrics handles requests for fetching latest metrics for multiple databases
func (server *WebUIServer) handleBatchLatestMetrics(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.Header().Set("Allow", "POST")
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Set CORS headers if needed
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Token")

	var dbnames []string
	if err := json.NewDecoder(r.Body).Decode(&dbnames); err != nil {
		server.l.WithError(err).Error("Failed to decode request body")
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if len(dbnames) == 0 {
		http.Error(w, "No database names provided", http.StatusBadRequest)
		return
	}

	response, err := server.GetBatchLatestMetrics(dbnames)
	if err != nil {
		server.l.WithError(err).Error("Failed to fetch batch metrics")
		http.Error(w, fmt.Sprintf("Failed to fetch metrics: %v", err), http.StatusInternalServerError)
		return
	}

	// Check if we got any results
	if len(response.Results) == 0 && len(response.Errors) == 0 {
		http.Error(w, "No metrics data available", http.StatusNotFound)
		return
	}

	if err := json.NewEncoder(w).Encode(response); err != nil {
		server.l.WithError(err).Error("Failed to encode response")
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}

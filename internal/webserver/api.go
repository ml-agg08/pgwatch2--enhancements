package webserver

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"time"
	"github.com/cybertec-postgresql/pgwatch/v3/internal/db"
	"github.com/cybertec-postgresql/pgwatch/v3/internal/metrics"
	"github.com/cybertec-postgresql/pgwatch/v3/internal/sources"
)

func (server *WebUIServer) TryConnectToDB(params []byte) (err error) {
	return db.Ping(context.TODO(), string(params))
}

// UpdatePreset updates the stored preset
func (server *WebUIServer) UpdatePreset(name string, params []byte) error {
	var p metrics.Preset
	err := json.Unmarshal(params, &p)
	if err != nil {
		return err
	}
	return server.metricsReaderWriter.UpdatePreset(name, p)
}

// GetPresets returns the list of available presets
func (server *WebUIServer) GetPresets() (res string, err error) {
	var mr *metrics.Metrics
	if mr, err = server.metricsReaderWriter.GetMetrics(); err != nil {
		return
	}
	b, _ := json.Marshal(mr.PresetDefs)
	res = string(b)
	return
}

// DeletePreset removes the preset from the configuration
func (server *WebUIServer) DeletePreset(name string) error {
	return server.metricsReaderWriter.DeletePreset(name)
}

// GetMetrics returns the list of metrics
func (server *WebUIServer) GetMetrics() (res string, err error) {
	var mr *metrics.Metrics
	if mr, err = server.metricsReaderWriter.GetMetrics(); err != nil {
		return
	}
	b, _ := json.Marshal(mr.MetricDefs)
	res = string(b)
	return
}

// UpdateMetric updates the stored metric information
func (server *WebUIServer) UpdateMetric(name string, params []byte) error {
	var m metrics.Metric
	err := json.Unmarshal(params, &m)
	if err != nil {
		return err
	}
	return server.metricsReaderWriter.UpdateMetric(name, m)
}

// DeleteMetric removes the metric from the configuration
func (server *WebUIServer) DeleteMetric(name string) error {
	return server.metricsReaderWriter.DeleteMetric(name)
}

// GetSources returns the list of sources fo find databases for monitoring
func (server *WebUIServer) GetSources() (res string, err error) {
	var dbs sources.Sources
	if dbs, err = server.sourcesReaderWriter.GetSources(); err != nil {
		return
	}
	b, _ := json.Marshal(dbs)
	res = string(b)
	return
}

// DeleteSource removes the source from the list of configured sources
func (server *WebUIServer) DeleteSource(database string) error {
	return server.sourcesReaderWriter.DeleteSource(database)
}

// UpdateSource updates the configured source information
func (server *WebUIServer) UpdateSource(params []byte) error {
	var md sources.Source
	err := json.Unmarshal(params, &md)
	if err != nil {
		return err
	}
	return server.sourcesReaderWriter.UpdateSource(md)
}

// GetLatestMetrics returns the latest recorded values for each metric for a given database
func (server *WebUIServer) GetLatestMetrics(dbname string) (string, error) {
	// Get list of metrics for this database
	rows, err := server.sinksWriter.GetLatestMetrics(dbname)
	if err != nil {
		return "", err
	}
	if rows == nil {
		return "{}", nil
	}
	defer (*rows).Close()

	// Convert to JSON
	metrics := make(map[string]interface{})
	var latestTime time.Time
	metricValues := make(map[string]interface{})

	for (*rows).Next() {
		var (
			time            time.Time
			tps             sql.NullFloat64
			qps             sql.NullFloat64
			avgQueryRuntime sql.NullFloat64
			blksHitRatio    sql.NullFloat64
			dbSize          sql.NullInt64
			txErrorRatio    sql.NullFloat64
			nonIdleSessions sql.NullInt64
			tempBytes       sql.NullInt64
		)
		
		err := (*rows).Scan(
			&time,
			&tps,
			&qps,
			&avgQueryRuntime,
			&blksHitRatio,
			&dbSize,
			&txErrorRatio,
			&nonIdleSessions,
			&tempBytes,
		)
		if err != nil {
			return "", err
		}

		latestTime = time
		metricValues["tps"] = fmt.Sprintf("%.4f", tps.Float64)
		metricValues["qps"] = fmt.Sprintf("%.4f", qps.Float64)
		metricValues["avg_query_runtime"] = fmt.Sprintf("%.4f", avgQueryRuntime.Float64)
		metricValues["blks_hit_ratio"] = fmt.Sprintf("%.4f", blksHitRatio.Float64)
		
		// Format db_size in MB
		if dbSize.Valid {
			metricValues["db_size"] = fmt.Sprintf("%.4f MB", float64(dbSize.Int64)/1024/1024)
		} else {
			metricValues["db_size"] = "0.0000 MB"
		}
		
		metricValues["tx_error_ratio"] = fmt.Sprintf("%.4f", txErrorRatio.Float64)
		metricValues["non_idle_sessions"] = nonIdleSessions.Int64
		
		// Format temp_bytes_written in KB
		if tempBytes.Valid {
			metricValues["temp_bytes_written"] = fmt.Sprintf("%.4f KB", float64(tempBytes.Int64)/1024)
		} else {
			metricValues["temp_bytes_written"] = "0.0000 KB"
		}
	}

	metrics["time"] = latestTime
	metrics["values"] = metricValues

	jsonBytes, err := json.Marshal(metrics)
	if err != nil {
		return "", err
	}
	return string(jsonBytes), nil
}

// MetricsResponse represents the structure of a single metrics response
type MetricsResponse struct {
	Time   time.Time              `json:"time"`
	Values map[string]interface{} `json:"values"`
}

// BatchMetricsResponse represents the response structure for batch metrics
type BatchMetricsResponse struct {
	Results map[string]*MetricsResponse `json:"results"`
	Errors  map[string]string          `json:"errors"`
}

// GetBatchLatestMetrics fetches the latest metrics for multiple databases
func (server *WebUIServer) GetBatchLatestMetrics(dbnames []string) (*BatchMetricsResponse, error) {
	response := &BatchMetricsResponse{
		Results: make(map[string]*MetricsResponse),
		Errors:  make(map[string]string),
	}

	for _, dbname := range dbnames {
		metricsStr, err := server.GetLatestMetrics(dbname)
		if err != nil {
			response.Errors[dbname] = err.Error()
			continue
		}

		var metricsData MetricsResponse
		if err := json.Unmarshal([]byte(metricsStr), &metricsData); err != nil {
			response.Errors[dbname] = fmt.Sprintf("Failed to parse metrics data: %v", err)
			continue
		}

		response.Results[dbname] = &metricsData
	}

	return response, nil
}

package webserver

import (
	"context"
	"database/sql"
	"encoding/json"
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
	for (*rows).Next() {
		var (
			time            time.Time
			tps             sql.NullFloat64
			qps             sql.NullFloat64
			avgQueryRuntime sql.NullFloat64
			blksHitRatio    sql.NullFloat64
			dbSize          sql.NullInt64
			txErrorRatio    sql.NullFloat64
		)
		
		err := (*rows).Scan(
			&time,
			&tps,
			&qps,
			&avgQueryRuntime,
			&blksHitRatio,
			&dbSize,
			&txErrorRatio,
		)
		if err != nil {
			return "", err
		}

		metrics["tps"] = map[string]interface{}{
			"value": tps.Float64,
			"time":  time,
		}
		metrics["qps"] = map[string]interface{}{
			"value": qps.Float64,
			"time":  time,
		}
		metrics["avg_query_runtime"] = map[string]interface{}{
			"value": avgQueryRuntime.Float64,
			"time":  time,
		}
		metrics["blks_hit_ratio"] = map[string]interface{}{
			"value": blksHitRatio.Float64,
			"time":  time,
		}
		metrics["db_size"] = map[string]interface{}{
			"value": dbSize.Int64,
			"time":  time,
		}
		metrics["tx_error_ratio"] = map[string]interface{}{
			"value": txErrorRatio.Float64,
			"time":  time,
		}
	}

	jsonBytes, err := json.Marshal(metrics)
	if err != nil {
		return "", err
	}
	return string(jsonBytes), nil
}

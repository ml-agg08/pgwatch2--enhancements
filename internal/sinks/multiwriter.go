package sinks

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"sync"

	"github.com/cybertec-postgresql/pgwatch/v3/internal/metrics"
	"github.com/jackc/pgx/v5"
)

// Writer defines the interface for metric sinks
type Writer interface {
	SyncMetric(dbUnique, metricName, op string) error
	Write(msgs []metrics.MeasurementEnvelope) error
	GetLatestMetrics(dbname string) (*pgx.Rows, error)
}

// MultiWriter ensures the simultaneous storage of data in several storages.
type MultiWriter struct {
	writers []Writer
	sync.Mutex
}

// NewSinkWriter creates and returns new instance of MultiWriter struct.
func NewSinkWriter(ctx context.Context, opts *CmdOpts, metricDefs *metrics.Metrics) (w Writer, err error) {
	if len(opts.Sinks) == 0 {
		return nil, errors.New("no sinks specified for measurements")
	}
	mw := &MultiWriter{}
	for _, s := range opts.Sinks {
		scheme, path, found := strings.Cut(s, "://")
		if !found || scheme == "" || path == "" {
			return nil, fmt.Errorf("malformed sink URI %s", s)
		}
		switch scheme {
		case "jsonfile":
			w, err = NewJSONWriter(ctx, path)
		case "postgres", "postgresql":
			w, err = NewPostgresWriter(ctx, s, opts, metricDefs)
		case "prometheus":
			w, err = NewPrometheusWriter(ctx, path)
		case "rpc":
			w, err = NewRPCWriter(ctx, path)
		default:
			return nil, fmt.Errorf("unknown schema %s in sink URI %s", scheme, s)
		}
		if err != nil {
			return nil, err
		}
		mw.AddWriter(w)
	}
	if len(mw.writers) == 1 {
		return mw.writers[0], nil
	}
	return mw, nil
}

func (mw *MultiWriter) AddWriter(w Writer) {
	mw.Lock()
	mw.writers = append(mw.writers, w)
	mw.Unlock()
}

func (mw *MultiWriter) SyncMetric(dbUnique, metricName, op string) (err error) {
	for _, w := range mw.writers {
		err = errors.Join(err, w.SyncMetric(dbUnique, metricName, op))
	}
	return
}

func (mw *MultiWriter) Write(msgs []metrics.MeasurementEnvelope) (err error) {
	for _, w := range mw.writers {
		err = errors.Join(err, w.Write(msgs))
	}
	return
}

func (mw *MultiWriter) GetLatestMetrics(dbname string) (*pgx.Rows, error) {
	for _, w := range mw.writers {
		rows, err := w.GetLatestMetrics(dbname)
		if err != nil {
			return nil, err
		}
		if rows != nil {
			return rows, nil
		}
	}
	return nil, nil
}

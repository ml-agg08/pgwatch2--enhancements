import React, { useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { Download as DownloadIcon, FileDownload as FileDownloadIcon } from '@mui/icons-material';
import { getToken } from 'services/Token';

interface LatestMetricsButtonProps {
  dbname: string;
}

interface MetricData {
  [key: string]: any;
}

interface MetricRow {
  name: string;
  value: string | number;
  unit?: string;
}

export const LatestMetricsButton: React.FC<LatestMetricsButtonProps> = ({ dbname }) => {
  const [open, setOpen] = useState(false);
  const [metrics, setMetrics] = useState<MetricData>({});
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleClickOpen = async () => {
    setLoading(true);
    setError('');
    try {
      const token = getToken();
      const response = await fetch(`/latest-metrics?dbname=${encodeURIComponent(dbname)}`, {
        headers: {
          'Token': token || '',
        },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to fetch metrics');
      }
      const data = await response.json();
      if (Object.keys(data).length === 0) {
        setError('No metrics data available');
      } else {
        setMetrics(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
      setMetrics({});
    } finally {
      setLoading(false);
      setOpen(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setMetrics({});
    setError('');
  };

  const handleDownloadJSON = () => {
    try {
      const dataStr = JSON.stringify(metrics, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const timestamp = metrics.time ? 
        new Date(metrics.time).toISOString().split('.')[0].replace(/[:]/g, '-') : 
        new Date().toISOString().split('.')[0].replace(/[:]/g, '-');
      link.download = `${dbname}_metrics_${timestamp}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('JSON export failed:', err);
      setError('JSON export failed');
    }
  };

  const handleDownloadCSV = () => {
    try {
      let csvContent = "Metric,Value\n";
  
      const flattenObject = (obj: MetricData, prefix = ''): string[] => {
        return Object.entries(obj).flatMap(([key, value]) => {
          const newKey = prefix ? `${prefix}.${key}` : key;
          if (typeof value === 'object' && value !== null) {
            return flattenObject(value as MetricData, newKey);
          } else {
            return [`"${newKey}","${value}"`];
          }
        });
      };
  
      const rows = flattenObject(metrics);
      csvContent += rows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const timestamp = metrics.time ? 
        new Date(metrics.time).toISOString().split('.')[0].replace(/[:]/g, '-') : 
        new Date().toISOString().split('.')[0].replace(/[:]/g, '-');
      link.download = `${dbname}_metrics_${timestamp}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('CSV export failed:', err);
      setError('CSV export failed');
    }
  };

  const formatMetricValue = (value: any): string => {
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    return String(value);
  };

  const getMetricRows = (data: MetricData, prefix = ''): MetricRow[] => {
    return Object.entries(data).flatMap(([key, value]) => {
      const name = prefix ? `${prefix}.${key}` : key;
      if (typeof value === 'object' && value !== null) {
        return getMetricRows(value as MetricData, name);
      } else {
        const displayName = name.replace(/^values\./, '');
        return [{
          name: displayName,
          value: formatMetricValue(value)
        }];
      }
    });
  };

  const metricRows = getMetricRows(metrics);

  return (
    <Box sx={{ display: 'inline-block', ml: 1 }}>
      <Button
        variant="outlined"
        startIcon={<DownloadIcon />}
        onClick={handleClickOpen}
        size="small"
        disabled={loading}
      >
        Latest Metrics
      </Button>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Latest Metrics for {dbname}</DialogTitle>
        <DialogContent>
          {error ? (
            <Box sx={{ color: 'error.main', py: 2 }}>{error}</Box>
          ) : (
            <TableContainer 
              component={Paper} 
              sx={{ 
                mt: 2,
                '& .MuiTableCell-root': {
                  py: 1.5,
                  fontSize: '0.875rem'
                },
                '& .MuiTableHead-root': {
                  backgroundColor: 'background.default'
                },
                '& .MuiTableRow-root:hover': {
                  backgroundColor: 'action.hover'
                }
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Metric</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Value</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {metricRows.map((row) => (
                    <TableRow key={row.name}>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'medium' }}>
                        {row.name}
                      </TableCell>
                      <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                        {row.value}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
          {Object.keys(metrics).length > 0 && (
            <>
              <Button onClick={handleDownloadJSON} variant="contained" color="primary" startIcon={<DownloadIcon />}>
                Download JSON
              </Button>
              <Button onClick={handleDownloadCSV} variant="contained" color="secondary" startIcon={<FileDownloadIcon />}>
                Download CSV
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 
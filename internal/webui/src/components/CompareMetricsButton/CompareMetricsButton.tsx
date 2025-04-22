import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import { CompareArrows } from '@mui/icons-material';
import { getToken } from 'services/Token';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CompareMetricsButtonProps {
  databases: string[];
}

interface MetricsData {
  time: string;
  values: {
    tps: string;
    qps: string;
    avg_query_runtime: string;
    blks_hit_ratio: string;
    db_size: string;
    tx_error_ratio: string;
    non_idle_sessions: number;
    temp_bytes_written: string;
  };
}

interface MetricsResponse {
  [key: string]: MetricsData | { error: string };
}

interface MetricsCache {
  [key: string]: MetricsData;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export const CompareMetricsButton: React.FC<CompareMetricsButtonProps> = ({ databases }) => {
  const [open, setOpen] = useState(false);
  const [db1, setDb1] = useState<string>('');
  const [db2, setDb2] = useState<string>('');
  const [metricsCache, setMetricsCache] = useState<MetricsCache>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showComparison, setShowComparison] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (open && databases.length > 0) {
      fetchAllMetrics();
    }
  }, [open, databases]);

  const fetchAllMetrics = async () => {
    if (databases.length === 0) return;
    
    setLoading(true);
    setError('');
    
    try {
      const token = getToken();
      const response = await fetch('/batch-latest-metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Token': token || '',
        },
        body: JSON.stringify(databases),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to fetch metrics');
      }

      const data: MetricsResponse = await response.json();
      const newCache: MetricsCache = {};
      
      // Check if we have any results
      if (!data.results || Object.keys(data.results).length === 0) {
        throw new Error('No metrics data available');
      }
      
      // Process results and errors
      Object.entries(data.results).forEach(([dbname, metrics]) => {
        newCache[dbname] = metrics;
      });

      // Handle any errors
      if (data.errors && Object.keys(data.errors).length > 0) {
        const errorMessages = Object.entries(data.errors)
          .map(([db, err]) => `${db}: ${err}`)
          .join('; ');
        setError(`Some databases had errors: ${errorMessages}`);
      }

      setMetricsCache(newCache);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
    } finally {
      setLoading(false);
    }
  };

  const handleCompare = () => {
    if (!db1 || !db2) {
      setError('Please select both databases to compare');
      return;
    }
    setShowComparison(true);
    setError('');
  };

  const handleClose = () => {
    setOpen(false);
    setDb1('');
    setDb2('');
    setShowComparison(false);
    setError('');
  };

  const calculateDifference = (value1: string | number, value2: string | number) => {
    const num1 = typeof value1 === 'string' ? parseFloat(value1) : value1;
    const num2 = typeof value2 === 'string' ? parseFloat(value2) : value2;
    return ((num2 - num1) / num1 * 100).toFixed(2);
  };

  const renderDifference = (label: string, value1: string | number, value2: string | number) => {
    const diff = calculateDifference(value1, value2);
    const color = parseFloat(diff) > 0 ? 'success.main' : parseFloat(diff) < 0 ? 'error.main' : 'text.primary';
    
    return (
      <Grid item xs={12} md={6} key={label}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>{label}</Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={4}>
              <Typography variant="body2">{value1}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2">{value2}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Chip
                label={`${diff}%`}
                size="small"
                sx={{ backgroundColor: color === 'error.main' ? '#ffebee' : '#e8f5e9', color }}
              />
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    );
  };

  const metrics1 = db1 ? metricsCache[db1] : null;
  const metrics2 = db2 ? metricsCache[db2] : null;

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const prepareChartData = (metricName: string, value1: string | number, value2: string | number) => {
    return [
      { name: db1, value: typeof value1 === 'string' ? parseFloat(value1) : value1 },
      { name: db2, value: typeof value2 === 'string' ? parseFloat(value2) : value2 }
    ];
  };

  const renderMetricChart = (label: string, value1: string | number, value2: string | number) => {
    const data = prepareChartData(label, value1, value2);
    const diff = calculateDifference(value1, value2);
    // Use a consistent color for all charts
    const color = '#1976d2'; // Material-UI primary blue

    return (
      <Grid item xs={12} md={6} key={label}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>{label}</Typography>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill={color} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
          <Box sx={{ mt: 1, textAlign: 'center' }}>
            <Chip
              label={`${diff}% difference`}
              size="small"
              sx={{ 
                backgroundColor: parseFloat(diff) > 0 ? '#e8f5e9' : '#ffebee',
                color: parseFloat(diff) > 0 ? 'success.main' : 'error.main'
              }}
            />
          </Box>
        </Paper>
      </Grid>
    );
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<CompareArrows />}
        onClick={() => setOpen(true)}
        sx={{ ml: 1 }}
      >
        Compare Metrics
      </Button>
      <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
        <DialogTitle>Compare Database Metrics</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>First Database</InputLabel>
              <Select
                value={db1}
                label="First Database"
                onChange={(e) => {
                  setDb1(e.target.value);
                  setShowComparison(false);
                }}
                disabled={loading}
              >
                {databases.map((db) => (
                  <MenuItem key={db} value={db} disabled={db === db2}>
                    {db}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Second Database</InputLabel>
              <Select
                value={db2}
                label="Second Database"
                onChange={(e) => {
                  setDb2(e.target.value);
                  setShowComparison(false);
                }}
                disabled={loading}
              >
                {databases.map((db) => (
                  <MenuItem key={db} value={db} disabled={db === db1}>
                    {db}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}

          {showComparison && metrics1 && metrics2 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Comparison Results
              </Typography>
              <Typography variant="caption" display="block" gutterBottom>
                Showing difference from {db1} to {db2}. Positive % means {db2} is higher.
              </Typography>

              <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 2 }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                  <Tab label="Table View" />
                  <Tab label="Charts" />
                </Tabs>
              </Box>

              <TabPanel value={tabValue} index={0}>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  {renderDifference('TPS', metrics1.values.tps, metrics2.values.tps)}
                  {renderDifference('QPS', metrics1.values.qps, metrics2.values.qps)}
                  {renderDifference('Avg Query Runtime', metrics1.values.avg_query_runtime, metrics2.values.avg_query_runtime)}
                  {renderDifference('Blocks Hit Ratio', metrics1.values.blks_hit_ratio, metrics2.values.blks_hit_ratio)}
                  {renderDifference('DB Size', metrics1.values.db_size, metrics2.values.db_size)}
                  {renderDifference('TX Error Ratio', metrics1.values.tx_error_ratio, metrics2.values.tx_error_ratio)}
                  {renderDifference('Non-idle Sessions', metrics1.values.non_idle_sessions, metrics2.values.non_idle_sessions)}
                  {renderDifference('Temp Bytes Written', metrics1.values.temp_bytes_written, metrics2.values.temp_bytes_written)}
                </Grid>
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <Grid container spacing={2}>
                  {renderMetricChart('TPS', metrics1.values.tps, metrics2.values.tps)}
                  {renderMetricChart('QPS', metrics1.values.qps, metrics2.values.qps)}
                  {renderMetricChart('Avg Query Runtime', metrics1.values.avg_query_runtime, metrics2.values.avg_query_runtime)}
                  {renderMetricChart('Blocks Hit Ratio', metrics1.values.blks_hit_ratio, metrics2.values.blks_hit_ratio)}
                  {renderMetricChart('DB Size', metrics1.values.db_size, metrics2.values.db_size)}
                  {renderMetricChart('TX Error Ratio', metrics1.values.tx_error_ratio, metrics2.values.tx_error_ratio)}
                  {renderMetricChart('Non-idle Sessions', metrics1.values.non_idle_sessions, metrics2.values.non_idle_sessions)}
                  {renderMetricChart('Temp Bytes Written', metrics1.values.temp_bytes_written, metrics2.values.temp_bytes_written)}
                </Grid>
              </TabPanel>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
          <Button 
            onClick={handleCompare}
            variant="contained"
            color="primary"
            disabled={!db1 || !db2 || loading}
          >
            Compare
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}; 
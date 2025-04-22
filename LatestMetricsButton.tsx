import React, { useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Box } from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import jsPDF from 'jspdf';
import { getToken } from 'services/Token';

interface LatestMetricsButtonProps {
  dbname: string;
}

export const LatestMetricsButton: React.FC<LatestMetricsButtonProps> = ({ dbname }) => {
  const [open, setOpen] = useState(false);
  const [metrics, setMetrics] = useState<string>('');
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
        setMetrics(JSON.stringify(data, null, 2));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
      setMetrics('');
    } finally {
      setLoading(false);
      setOpen(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setMetrics('');
    setError('');
  };

  const handleDownload = () => {
    try {
      const doc = new jsPDF();
      
      doc.setFontSize(16);
      doc.text(`Latest Metrics for ${dbname}`, 20, 20);
      
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30);
      
      doc.setFontSize(10);
      const metricsObj = JSON.parse(metrics);
      let yPos = 40;
      
      Object.entries(metricsObj).forEach(([metricName, data]: [string, any]) => {
        doc.setFont('helvetica', 'bold');
        yPos += 10;
        doc.text(metricName, 20, yPos);
        
        doc.setFont('helvetica', 'normal');
        const details = typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data);
        const lines = doc.splitTextToSize(details, 170);
        
        lines.forEach((line: string) => {
          yPos += 7;
          if (yPos > 280) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(line, 20, yPos);
        });
      });
      
      doc.save(`latest_metrics_${dbname}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      setError('Failed to generate PDF');
    }
  };

  const handleDownloadCSV = () => {
    try {
      const metricsObj = JSON.parse(metrics);
      let csvContent = "Metric,Value\n";
  
      // Flatten nested objects
      const flattenObject = (obj: any, prefix = ''): string[] => {
        return Object.entries(obj).flatMap(([key, value]) => {
          const newKey = prefix ? `${prefix}.${key}` : key;
          if (typeof value === 'object' && value !== null) {
            return flattenObject(value, newKey);
          } else {  // Fixed: Using curly braces
            return [`"${newKey}","${value}"`];  // Fixed: Proper template literals
          }
        });
      };
  
      // Generate and download CSV
      const rows = flattenObject(metricsObj);
      csvContent += rows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${dbname}_metrics.csv`;
      link.click();
    } catch (err) {
      console.error('CSV export failed:', err);
      setError('CSV export failed');
    }
  };

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
            <TextField
              multiline
              fullWidth
              value={metrics}
              InputProps={{ 
                readOnly: true,
                sx: { 
                  fontFamily: 'monospace',
                  minHeight: '300px'
                }
              }}
              variant="outlined"
              sx={{ mt: 2 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
          {metrics && (
            <>
              <Button onClick={handleDownload} variant="contained" color="primary">
                Download PDF
              </Button>
              <Button 
                onClick={handleDownloadCSV} 
                variant="contained" 
                color="secondary"
                sx={{ ml: 1 }}
              >
                Download CSV
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

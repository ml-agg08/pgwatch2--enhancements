import React from 'react';
import { Box } from '@mui/material';
import { DataGrid } from "@mui/x-data-grid";
import { Error } from "components/Error/Error";
import { Loading } from "components/Loading/Loading";
import { SourceFormDialog } from "containers/SourceFormDialog/SourceFormDialog";
import { SourceFormProvider } from "contexts/SourceForm/SourceForm.provider";
import { useGridColumnVisibility } from 'hooks/useGridColumnVisibility';
import { usePageStyles } from "styles/page";
import { useSources } from "queries/Source";
import { useSourcesGridColumns } from "./SourcesGrid.consts";
import { SourcesGridToolbar } from "./components/SourcesGridToolbar";
import { CompareMetricsButton } from '../../../../components/CompareMetricsButton/CompareMetricsButton';

export const SourcesGrid = () => {
  const { classes } = usePageStyles();

  const { data, isLoading, isError, error } = useSources();

  const columns = useSourcesGridColumns();
  const { columnVisibility, onColumnVisibilityChange } = useGridColumnVisibility('SOURCES_GRID', columns);

  const databases = data?.map(source => source.Name) || [];

  const CustomToolbar = () => (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <SourcesGridToolbar />
      <CompareMetricsButton databases={databases} />
    </Box>
  );

  if (isLoading) {
    return (
      <Loading />
    );
  }

  if (isError) {
    const err = error as Error;
    return (
      <Error message={err.message} />
    );
  }

  return (
    <div className={classes.page}>
      <SourceFormProvider>
        <DataGrid
          getRowId={(row) => row.Name}
          columns={columns}
          rows={data ?? []}
          rowsPerPageOptions={[]}
          components={{ Toolbar: CustomToolbar }}
          disableColumnMenu
          columnVisibilityModel={columnVisibility}
          onColumnVisibilityModelChange={onColumnVisibilityChange}
        />
        <SourceFormDialog />
      </SourceFormProvider>
    </div>
  );
};

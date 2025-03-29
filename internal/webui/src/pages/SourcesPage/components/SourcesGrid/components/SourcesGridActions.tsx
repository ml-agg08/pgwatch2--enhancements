import { useEffect, useMemo, useState } from "react";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Box, IconButton } from "@mui/material";
import { GridActions } from "components/GridActions/GridActions";
import { WarningDialog } from "components/WarningDialog/WarningDialog";
import { useSourceFormContext } from "contexts/SourceForm/SourceForm.context";
import { SourceFormActions } from "contexts/SourceForm/SourceForm.types";
import { Source } from "types/Source/Source";
import { useDeleteSource } from "queries/Source";
import { LatestMetricsButton } from "components/LatestMetricsButton/LatestMetricsButton";

type Props = {
  source: Source;
};

export const SourcesGridActions = ({ source }: Props) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setData, setAction, handleOpen } = useSourceFormContext();
  const { mutate, isSuccess } = useDeleteSource();

  const handleDialogClose = () => setDialogOpen(false);

  const handleEditClick = () => {
    setData(source);
    setAction(SourceFormActions.Edit);
    handleOpen();
  };

  const handleCopyClick = () => {
    setData(source);
    setAction(SourceFormActions.Copy);
    handleOpen();
  };

  const handleDeleteClick = () => setDialogOpen(true);

  const handleSubmit = () => mutate(source.Name);

  const message = useMemo(
    () => `Are you sure want to delete source "${source.Name}"`,
    [source],
  );

  useEffect(() => {
    isSuccess && handleDialogClose();
  }, [isSuccess]);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', minWidth: 'fit-content', justifyContent: 'flex-end',
      overflowX: 'auto', whiteSpace: 'nowrap' }}>
      <GridActions handleEditClick={handleEditClick} handleDeleteClick={handleDeleteClick}>
        <IconButton title="Copy" onClick={handleCopyClick}>
          <ContentCopyIcon />
        </IconButton>
      </GridActions>
      <LatestMetricsButton dbname={source.Name} />
      <WarningDialog open={dialogOpen} message={message} onClose={handleDialogClose} onSubmit={handleSubmit} />
    </Box>
  );
};

import { usePageStyles } from "styles/page";
import { SourcesGrid } from "./components/SourcesGrid/SourcesGrid";
import { LatestMetricsButton } from '../../components/LatestMetricsButton/LatestMetricsButton';

export const SourcesPage = () => {
  const { classes } = usePageStyles();

  return(
    <div className={classes.root}>
      <SourcesGrid />
    </div>
  );
};

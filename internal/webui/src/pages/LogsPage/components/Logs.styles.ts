import { makeStyles } from "tss-react/mui";

export const useLogsStyles = makeStyles()(
  () => ({
    root: {
      display: "flex",                // Added Flexbox
      backgroundColor: "white",       //  Changed from black
      flexGrow: 1,
      position: "relative",
      width: "100%",
      height: "100%",
    },
    grid: {
      color: "black",                 //  Changed from white
      position: "absolute",
      inset: "1em",
      overflowY: "auto",
      overflowX: "hidden",
      wordWrap: "break-word",
      whiteSpace: "pre-wrap",
      fontSize: "14px",
      margin: 0,
      display: "flex",                // Added Flexbox
      flexDirection: "column",        // Added column layout
      gap: "5px",                    //  Added consistent spacing
    },
    log: {
      margin: "0 0 0.5em",
    },
  }),
);
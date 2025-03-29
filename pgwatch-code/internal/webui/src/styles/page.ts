import { makeStyles } from "tss-react/mui";

export const usePageStyles = makeStyles()(
  () => ({
    root: {
      flex: "1 1 auto",
      background: "linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)",
      minHeight: "100vh",
    },
    page: {
      display: "flex",
      flexDirection: "column",
      gap: "24px",
      height: "100%",
      padding: "24px",
      maxWidth: "1400px",
      margin: "0 auto",
      "& > *": {
        background: "white",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
        padding: "24px",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          boxShadow: "0 6px 24px rgba(0, 0, 0, 0.08)",
          transform: "translateY(-2px)",
        },
      },
    },
  }),
);
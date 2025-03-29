import { makeStyles } from "tss-react/mui";

export const useLoginFormStyles = makeStyles()(
  () => ({
    root: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)",
      padding: "20px",
    },
    form: {
      width: "100%",
      maxWidth: "400px",
      display: "flex",
      flexDirection: "column",
      gap: "24px",
      padding: "40px",
      background: "white",
      borderRadius: "16px",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
      transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
      "&:hover": {
        transform: "translateY(-4px)",
        boxShadow: "0 12px 48px rgba(0, 0, 0, 0.15)",
      },
    },
    title: {
      textAlign: "center",
      marginBottom: "32px",
      color: "#1a237e",
      fontWeight: 600,
      fontSize: "2.5rem",
    },
    input: {
      "& .MuiOutlinedInput-root": {
        borderRadius: "8px",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          backgroundColor: "rgba(0, 0, 0, 0.02)",
        },
        "&.Mui-focused": {
          backgroundColor: "rgba(0, 0, 0, 0.04)",
        },
      },
      "& .MuiInputLabel-root": {
        color: "#666",
        "&.Mui-focused": {
          color: "#1a237e",
        },
      },
    },
    button: {
      marginTop: "16px",
      padding: "12px",
      borderRadius: "8px",
      textTransform: "none",
      fontSize: "1rem",
      fontWeight: 600,
      background: "linear-gradient(45deg, #1a237e 30%, #283593 90%)",
      transition: "all 0.2s ease-in-out",
      "&:hover": {
        background: "linear-gradient(45deg, #283593 30%, #1a237e 90%)",
        transform: "translateY(-2px)",
        boxShadow: "0 4px 12px rgba(26, 35, 126, 0.3)",
      },
      "&:active": {
        transform: "translateY(0)",
      },
    },
    error: {
      color: "#d32f2f",
      fontSize: "0.875rem",
      marginTop: "4px",
    },
  })
);
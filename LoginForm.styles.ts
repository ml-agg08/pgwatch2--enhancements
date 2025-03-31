import { makeStyles } from "tss-react/mui";

export const useLoginFormStyles = makeStyles()(
  () => ({
    form: {
      width: "270px",
      display: "flex",
      flexDirection: "column",
      gap: "24px",
    },
    input: {
      "& .MuiOutlinedInput-root": {
        transition: "all 0.3s ease-in-out",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          backgroundColor: "rgba(102, 126, 234, 0.04)",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#667eea",
          },
        },
        "&.Mui-focused": {
          backgroundColor: "rgba(102, 126, 234, 0.08)",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#764ba2",
          },
        },
      },
      "& .MuiInputLabel-root": {
        transition: "color 0.3s ease-in-out",
        "&.Mui-focused": {
          color: "#764ba2",
        },
      },
    },
    button: {
      transition: "all 0.3s ease-in-out",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        background: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
      },
      "&:active": {
        transform: "translateY(0)",
        background: "linear-gradient(135deg, #5a6fd1 0%, #6a439f 100%)",
      },
    },
  })
);

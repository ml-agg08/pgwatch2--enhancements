import { makeStyles } from "tss-react/mui";

export const useFormStyles = makeStyles()(
  () => ({
    formDialog: {
      "& .MuiPaper-root": {
        maxWidth: "750px",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
      },
    },
    formContent: {
      maxWidth: "550px",
      width: "550px",
      padding: "24px",
    },
    form: {
      paddingTop: "20px",
      width: "100%",
      display: "flex",
      flexFlow: "column",
      gap: "16px",
    },
    row: {
      display: "flex",
      width: "100%",
      alignItems: "flex-start",
      justifyContent: "space-between",
      transition: "all 0.2s ease-in-out",
      "&:hover": {
        transform: "translateY(-1px)",
      },
    },
    formControlInput: {
      display: "flex",
      "&$formControlBlock": {
        display: "block",
      },
      "& .MuiFormHelperText-root": {
        margin: "0px",
        paddingLeft: "5px",
        transition: "all 0.2s ease-in-out",
      },
      "& .MuiInputBase-root": {
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          backgroundColor: "rgba(0, 0, 0, 0.02)",
        },
        "&.Mui-focused": {
          backgroundColor: "rgba(0, 0, 0, 0.04)",
        },
      },
    },
    formControlCheckbox: {
      "&.MuiFormControlLabel-root": {
        flexDirection: "unset",
        marginLeft: "0px",
        width: "fit-content",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          transform: "scale(1.02)",
        },
      },
    },
    addButton: {
      justifyContent: "end",
      "& .MuiButton-root": {
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-1px)",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        },
      },
    },
    formButtons: {
      "&.MuiDialogActions-root": {
        padding: "16px 24px",
        gap: "12px",
      },
      "& .MuiButton-root": {
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-1px)",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        },
      },
    },
    widthDefault: {
      maxWidth: "270px",
      width: "100%",
    },
    widthFull: {
      maxWidth: "100%",
      width: "100%",
    },
    hidden: {
      display: "none",
    }
  }),
);
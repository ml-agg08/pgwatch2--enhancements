# 🎨pgwatch(v3) UI Improvements 

## This documentation details the complete transformation of a basic login form into a modern,interactive, and secure authentication interface using Material-UI (MUI), TSS-React and Yup validation. The enhancements include:


✅ Visual & Interaction Upgrades (Animations, Gradients, Hover Effects)


✅ Functional Improvements (Form Validation, Password Toggle, Success Feedback)


✅ Codebase Refactoring (Modular Styles, Type Safety, Separation of Concerns)


✅ Performance & UX Optimizations (Smooth Transitions, Snackbar Notifications)

##  Quick Start


## 1. Clone the Repository


``` git clone https://github.com/cybertec-postgresql/pgwatch/ ```

## 📦 Dependencies

## 2. Install dependencies 
```json
{
  "dependencies": {
    "@mui/material": "^5.14.0",
    "tss-react": "^4.0.0"
  }
}
```
1.  npm install

2.  npm start (for viewing UI)

## Directory Structure
```
pgwatch/

└── internal/

    └── webui/  
    
        └── src/
        
            └── pages/
            
                └── loginPage/
                
                    └── loginForm/
                    
                        ├── LoginForm.tsx  
                                  
                        └── loginForm.styles.tsx

```
                        
## 🔐 Login Form Updations (LoginForm.tsx)
1. Login Form Modernization
   
Before (Basic Implementation)

``` import { yupResolver } from "@hookform/resolvers/yup";
import { Button, FormControl, FormHelperText, InputLabel, OutlinedInput, Typography } from "@mui/material";
import { PasswordInput } from "components/PasswordInput/PasswordInput";
import { SubmitHandler, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useFormStyles } from "styles/form";
import { useLogin } from "queries/Auth";
import { loginFormValuesValidationSchema } from "./LoginForm.consts";
import { useLoginFormStyles } from "./LoginForm.styles";
import { LoginFormValues } from "./LoginForm.types";

export const LoginForm = () => {
  const { classes: loginFormClasses, cx } = useLoginFormStyles();
  const { classes: formClasses } = useFormStyles();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: yupResolver(loginFormValuesValidationSchema),
  });

  const navigate = useNavigate();
  const login = useLogin(navigate);

  const getError = (field: keyof LoginFormValues) => {
    const error = errors[field];
    return error && error.message;
  };

  const onSubmit: SubmitHandler<LoginFormValues> = (values) => {
    login.mutate(values);
  };

  return (
    <>
      <Typography variant="h3">Login</Typography>
      <form onSubmit={handleSubmit(onSubmit)} className={loginFormClasses.form}>
        <FormControl
          className={cx(formClasses.formControlInput, formClasses.widthDefault)}
          error={!!getError("user")}
          variant="outlined"
        >
          <InputLabel htmlFor="user">User</InputLabel>
          <OutlinedInput
            {...register("user")}
            id="user"
            label="User"
          />
          <FormHelperText>{getError("user")}</FormHelperText>
        </FormControl>
        <FormControl
          className={cx(formClasses.formControlInput, formClasses.widthDefault)}
          error={!!getError("password")}
          variant="outlined"
        >
          <InputLabel htmlFor="password">Password</InputLabel>
          <PasswordInput
            {...register("password")}
            id="password"
            label="Password"
          />
          <FormHelperText>{getError("password")}</FormHelperText>
        </FormControl>
        <Button
          type="submit"
          variant="contained"
        >
          Login
        </Button>
      </form>
    </>
  );
};

```

After (Updated one)
``` import { yupResolver } from "@hookform/resolvers/yup";
import { FormControl, InputLabel, OutlinedInput, FormHelperText, Button, Snackbar, Alert, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useLoginFormStyles } from "./LoginForm.styles";
import { useFormStyles } from "styles/form";
import { PasswordInput } from "components/PasswordInput/PasswordInput";
import { useState } from "react";
import { useLogin } from "queries/Auth";
import { loginFormValuesValidationSchema } from "./LoginForm.consts";
import { LoginFormValues } from "./LoginForm.types";
import { SubmitHandler, useForm } from "react-hook-form";

export const LoginForm = () => {
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: yupResolver(loginFormValuesValidationSchema),
  });
  const { classes: loginFormClasses } = useLoginFormStyles();
  const { classes: formClasses } = useFormStyles();
  const login = useLogin(navigate);

  const getError = (field: keyof LoginFormValues) => errors[field]?.message;

  const onSubmit: SubmitHandler<LoginFormValues> = (values) => {
    setShowSuccess(true);
    setTimeout(() => {
      login.mutate(values);
    }, 1500);
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
  };

  return (
    <>
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom 
        align="center"
        sx={{ 
          fontWeight: 'bold',
          mb: 4,
          color: 'primary.main'
        }}
      >
        Login
      </Typography>
      
      <form onSubmit={handleSubmit(onSubmit)} className={loginFormClasses.form}>
        <FormControl
          className={`${formClasses.formControlInput} ${formClasses.widthFull} ${loginFormClasses.input}`}
          error={!!getError("user")}
          variant="outlined"
        >
          <InputLabel htmlFor="user">Username</InputLabel>
          <OutlinedInput
            {...register("user")}
            id="user"
            label="Username"
            placeholder="Enter your username"
          />
          <FormHelperText>{getError("user")}</FormHelperText>
        </FormControl>
        <FormControl
          className={`${formClasses.formControlInput} ${formClasses.widthFull} ${loginFormClasses.input}`}
          error={!!getError("password")}
          variant="outlined"
        >
          <InputLabel htmlFor="password">Password</InputLabel>
          <PasswordInput
            {...register("password")}
            id="password"
            label="Password"
            placeholder="Enter your password"
          />
          <FormHelperText>{getError("password")}</FormHelperText>
        </FormControl>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          className={loginFormClasses.button}
          fullWidth
        >
          Sign In
        </Button>
      </form>

      <Snackbar 
        open={showSuccess} 
        autoHideDuration={1500} 
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSuccess} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          Login Successful! Redirecting to Sources...
        </Alert>
      </Snackbar>
    </>
  );
};
```


Key Improvements:


✔ Gradient Button – More engaging call-to-action.


✔ Hover & Focus States – Visual feedback for better UX.


✔ Smooth Animations – transition for polished interactions.


🛠️ 2. Form Logic Separation

   
Before:
•	Validation and submission logic intertwined.


After:
•	react-hook-form for form handling.
•	yupResolver for schema validation.


⚡Overview  New Features Added
Feature	   Before	   After


Success Toast	❌ None	✅ Snackbar with auto-redirect


Password Toggle	❌ Plain text	✅ Secure PasswordInput component


Form Validation	❌ Basic	✅ Yup schema integration

## 🔐 Login Form Syles Updations (LoginForm.styles.ts)
2. Login Form Styling

Before:

``` import { makeStyles } from "tss-react/mui";

export const useLoginFormStyles = makeStyles()(
  () => ({
    form: {
      width: "270px",
      display: "flex",
      flexDirection: "column",
      gap: "24px",
    },
  })
);
```
After:

```import { makeStyles } from "tss-react/mui";

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
```


Results:


Previous LoginPage UI pgwatch

https://github.com/user-attachments/assets/374a2a57-31c1-4a8e-b8f2-acd4e07c8065



Updated LoginPage UI pgwatch



https://github.com/user-attachments/assets/66b5d2d8-a7bf-48b7-999e-efb1b783d937



 Page Layout Styling 
 
✅ Before


•	Basic page layout with static background and minimal styling.


•	No hover effects or transitions on page components.


•	Limited visual hierarchy and interactivity.


✨ Key Changes


•	Gradient Background: Added a subtle gradient for a modern look.


•	Card-Like Components: Each child element now has a white background, rounded corners, and shadow effects.


•	Hover Effects: Components lift slightly and increase shadow on hover for better interactivity.


•	Consistent Spacing: Uniform padding and gap between elements for a clean layout.
________________________________________
🚀 Feature Benefits


•	Improved User Experience: Smooth transitions and hover effects make the UI feel more responsive.


•	Visual Appeal: Modern design elements like gradients, shadows, and rounded corners enhance aesthetics.


•	Maintainability: TSS-React ensures type-safe styling and easy scalability.


•	Responsiveness: Flexbox and dynamic spacing adapt to different screen sizes.
________________________________________
🔍 Testing Checklist


•	✅ Hover Effects: Verify buttons, inputs, and cards respond to hover.


•	✅ Transitions: Ensure animations are smooth and consistent.


•	✅ Responsiveness: Test layout on different screen sizes.


•	✅ Styling Consistency: Confirm all components follow the new design system.
________________________________________
🎨 UI Impact Summary


Component	Before	After


Form Dialogs	Static, flat design	Rounded corners, shadows, hover effects


Page Layout	Basic background, no hierarchy	Gradient background, card-like components


Buttons/Inputs	Minimal interactivity	Smooth transitions and hover states


Spacing	Inconsistent gaps	Uniform padding and flexbox gaps
________________________________________
This documentation serves as a reference for future styling enhancements and ensures consistency across the application. The use of MUI and TSS-React provides a robust foundation for scalable and maintainable UI development.

RESULTS:

BEFORE:


![Image](https://github.com/user-attachments/assets/44dbaff5-07fc-4d0c-ae09-50e9dff45d0f)



AFTER:


![Image](https://github.com/user-attachments/assets/b5aeedec-77b6-4d0f-b40c-141ec59d0405)

## LOGS PAGE UI UPDATIONS:

 BEFORE:
```

import { makeStyles } from "tss-react/mui";

export const useLogsStyles = makeStyles()(
  () => ({
    root: {
      backgroundColor: "black",
      flexGrow: 1,
      position: "relative",
      width: "100%",
      height: "100%",
    },
    grid: {
      color: "white",
      position: "absolute",
      inset: "1em",
      overflowY: "auto",
      overflowX: "hidden",
      wordWrap: "break-word",
      whiteSpace: "pre-wrap",
      fontSize: "14px",
      margin: 0
    },
    log: {
      margin: "0 0 0.5em",
    },
  }),
);

```


AFTER:

```
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
```
OUTPUTS:


BEFORE:


![Image](https://github.com/user-attachments/assets/f3c09dfc-0aac-44f9-b812-b07507f79d39)


AFTER:

![Image](https://github.com/user-attachments/assets/6cdb29fe-8b80-461d-8b6d-28fe63909f7f)


🚀 Feature Benefits
•	Improved User Experience: Smooth transitions and hover effects make the UI feel more responsive and also changed background color to maintain uniformity.


•	Responsiveness: Flexbox and dynamic spacing adapt to different screen sizes.



## 📌 Need more details? Check out in this :


 Alert System Documentation

 https://grafana.com/docs/grafana/latest/alerting/ 

  Alert PDF (Learnings)


## For complete Information:

 Visit pgwatch documentation 

 https://github.com/cybertec-postgresql/pgwatch/


 Conclusion

Thank you for checking out this project! If you found it useful, consider giving it a ⭐️ to show your support.

   

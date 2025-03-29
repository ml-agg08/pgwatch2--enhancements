import { yupResolver } from "@hookform/resolvers/yup";
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
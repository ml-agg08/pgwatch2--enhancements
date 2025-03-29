import { yupResolver } from "@hookform/resolvers/yup";
import { Button, FormControl, FormHelperText, InputLabel, OutlinedInput, Typography, CircularProgress } from "@mui/material";
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

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
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
    <div className={loginFormClasses.root}>
      <form onSubmit={handleSubmit(onSubmit)} className={loginFormClasses.form}>
        <Typography variant="h3" className={loginFormClasses.title}>
          Welcome Back
        </Typography>
        <Typography variant="body1" sx={{ textAlign: "center", color: "#666", mb: 3 }}>
          Please sign in to continue
        </Typography>
        
        <FormControl
          className={cx(formClasses.formControlInput, formClasses.widthDefault, loginFormClasses.input)}
          error={!!getError("user")}
          variant="outlined"
        >
          <InputLabel htmlFor="user">Username</InputLabel>
          <OutlinedInput
            {...register("user")}
            id="user"
            label="Username"
            placeholder="Enter your username"
            autoComplete="username"
            autoFocus
          />
          <FormHelperText className={loginFormClasses.error}>{getError("user")}</FormHelperText>
        </FormControl>

        <FormControl
          className={cx(formClasses.formControlInput, formClasses.widthDefault, loginFormClasses.input)}
          error={!!getError("password")}
          variant="outlined"
        >
          <InputLabel htmlFor="password">Password</InputLabel>
          <PasswordInput
            {...register("password")}
            id="password"
            label="Password"
            placeholder="Enter your password"
            autoComplete="current-password"
          />
          <FormHelperText className={loginFormClasses.error}>{getError("password")}</FormHelperText>
        </FormControl>

        <Button
          type="submit"
          variant="contained"
          className={loginFormClasses.button}
          disabled={isSubmitting}
          fullWidth
        >
          {isSubmitting ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Sign In"
          )}
        </Button>

        <Typography 
          variant="body2" 
          sx={{ 
            textAlign: "center", 
            color: "#666", 
            mt: 2,
            "& a": {
              color: "#1a237e",
              textDecoration: "none",
              "&:hover": {
                textDecoration: "underline",
              },
            },
          }}
        >
          Forgot your password? <a href="#">Reset it here</a>
        </Typography>
      </form>
    </div>
  );
};
import { object, ref, string } from "yup";

export const LoginSchema = object().shape({
  username: string().required("Username is required"),
  password: string().required("Password is required"),
  captcha: string().when("$chap", {
    is: "0",
    then: (schema) => schema.required("Captcha is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
});

export const RegisterSchema = object().shape({
  name: string().required("Name is required"),
  email: string()
    .email("This field must be an email")
    .required("Email is required"),
  password: string().required("Password is required"),
  confirmPassword: string()
    .required("Confirm password is required")
    .oneOf([ref("password")], "Passwords must match"),
});

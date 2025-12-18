import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// import illustration from "@/assets/login-illustration.png"
import { loginSchema, type LoginSchema } from "@/schemas/auth/login.schema";
import { authService } from "@/services/auth.service";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/stores/user.store";
import { useAuth } from "@/components/context/AuthContext";
// import Logo from "@/assets/logo.svg?react"

export default function LoginPage() {
  const navigate = useNavigate();
  const { login: authContextLogin } = useAuth();

  const [isLoading, setIsLoading] = useState(false);

  // showPassword per-field
  // const [showPassword, setShowPassword] = useState(false);

  // === Login Form ===
  const loginForm = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // === Handlers ===
  const onLogin = async (data: LoginSchema) => {
    setIsLoading(true);
    try {
      const res = await authService.login(data.email, data.password);
      console.log(res);
      const store = useUserStore.getState();
      store.setTokens(res.accessToken, res.refreshToken);
      store.setUser(res.user);

      // Cũng lưu vào AuthContext (optional, nếu muốn dùng cả hai)
      authContextLogin(res.user, res.accessToken, res.refreshToken);

      //toast.success("Welcome back to VolunteerHub!");
      navigate("/home");
    } catch (error: any) {
      console.log(error);
      //   toast.error(
      //     error?.response?.data?.message ||
      //       "Login failed. Please check your credentials."
      //   );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            {/* <div className="h-12 w-auto overflow-hidden flex items-center">
              <Logo
                width={undefined}
                height={undefined}
                className="h-12 w-auto text-foreground transition-colors"
                preserveAspectRatio="xMidYMid meet"
              />
            </div> */}
          </a>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <form
              className={"flex flex-col gap-6"}
              onSubmit={loginForm.handleSubmit(onLogin)}
            >
              <FieldGroup>
                <div className="flex flex-col items-center gap-1 text-center">
                  <h1 className="text-2xl font-bold">Login to your account</h1>
                  <p className="text-muted-foreground text-sm text-balance">
                    Enter your info below to login to your account
                  </p>
                </div>

                <Field>
                  <FieldLabel htmlFor="login-email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    {...loginForm.register("email")}
                    required
                  />
                  {loginForm.formState.errors.email && (
                    <FieldDescription className="text-red-500">
                      {loginForm.formState.errors.email.message}
                    </FieldDescription>
                  )}
                </Field>

                <Field>
                  <div className="flex items-center">
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <a
                      href="/password_reset"
                      className="ml-auto text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    disabled={isLoading}
                    {...loginForm.register("password")}
                    required
                  />
                  {loginForm.formState.errors.password && (
                    <FieldDescription className="text-red-500">
                      {loginForm.formState.errors.password.message}
                    </FieldDescription>
                  )}
                </Field>

                <Field>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Login"}
                  </Button>
                </Field>

                <FieldSeparator>Or continue with</FieldSeparator>

                <Field>
                  <Button variant="outline" type="button">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path
                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                        fill="currentColor"
                      />
                    </svg>
                    Login with Google
                  </Button>

                  <FieldDescription className="text-center">
                    Don't have an account?{" "}
                    <a
                      href="/register"
                      className="underline underline-offset-4"
                    >
                      Sign up
                    </a>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </div>
        </div>
      </div>

      {/* <div className="bg-muted relative hidden lg:block">
        <img
          src={illustration}
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div> */}
    </div>
  );
}

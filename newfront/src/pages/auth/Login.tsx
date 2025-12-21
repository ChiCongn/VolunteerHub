import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { loginSchema, type LoginSchema } from "@/schemas/auth/login.schema";
import { authService } from "@/services/auth.service";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/stores/user.store";
import { useAuth } from "@/components/context/AuthContext";
import { userStartsService } from "@/services/user/user-stats.service";
import { useAuthState } from "@/hooks/useAuthState";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

import volunteerImg from "@/assets/volunteer.png";

export default function LoginPage() {
  const user = useAuthState();
  const navigate = useNavigate();
  const { login: authContextLogin } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      const store = useUserStore.getState();
      store.setTokens(res.accessToken, res.refreshToken);
      store.setUser(res.user);

      authContextLogin(res.user, res.accessToken, res.refreshToken);

      userStartsService.trackUserLogin();

      toast.success("Welcome back to VolunteerHub!");
      if (res.user?.role === "admin") {
        navigate("/admin/overview");
      } else if (res.user?.role === "volunteer") {
        navigate("/home");
      } else {
        navigate("/event-manage");
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-svh grid grid-cols-1 lg:grid-cols-3">
      {/* ===== LEFT PANEL ===== */}
      <div className="hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-primary/10 to-primary/5 p-10">
        <h2 className="text-3xl font-bold mb-4 text-center">
          Welcome to VolunteerHub
        </h2>
        <p className="text-muted-foreground text-center max-w-sm">
          Join hands with communities, manage meaningful events, and create real
          impact together.
        </p>

        <div className="mt-8 w-full max-w-xs">
          <img
            src={volunteerImg}
            alt="Volunteer illustration"
            className="w-full object-contain"
          />
        </div>
      </div>

      {/* ===== CENTER (LOGIN FORM) ===== */}
      <div className="flex items-center justify-center px-6 lg:px-0">
        <div className="w-full max-w-sm p-6 md:p-10">
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-xs">
              <form
                className="flex flex-col gap-6"
                onSubmit={loginForm.handleSubmit(onLogin)}
              >
                <FieldGroup>
                  <div className="flex flex-col items-center gap-1 text-center">
                    <h1 className="text-2xl font-bold">
                      Login to your account
                    </h1>
                    <p className="text-muted-foreground text-sm">
                      Enter your information below
                    </p>
                  </div>

                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
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
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        disabled={isLoading}
                        {...loginForm.register("password")}
                        required
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
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

                  <Field>
                    <FieldDescription className="text-center">
                      Don&apos;t have an account?{" "}
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
      </div>

      {/* ===== RIGHT PANEL ===== */}
      <div className="hidden lg:flex flex-col justify-center items-center bg-muted/30 p-10">
        <blockquote className="max-w-sm text-center">
          <p className="text-lg font-medium">
            “The best way to find yourself is to lose yourself in the service of
            others.”
          </p>
          <footer className="mt-4 text-sm text-muted-foreground">
            — Mahatma Gandhi —
          </footer>
        </blockquote>
      </div>
    </div>
  );
}

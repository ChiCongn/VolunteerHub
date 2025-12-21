import { useState } from "react";
import { Check } from "lucide-react";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import {
  registerSchema,
  type RegisterSchema,
} from "@/schemas/auth/register.schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authService } from "@/services/auth.service";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { getPasswordStrength } from "@/utils/password.utils";
import { useUserStore } from "@/stores/user.store";
import { useAuth } from "@/components/context/AuthContext";
import { userStartsService } from "@/services/user/user-stats.service";
import { toast } from "sonner";

import volunteerImg from "@/assets/register.png";

export default function SignupPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login: authContextLogin } = useAuth();

  const registerForm = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const watchedPassword = registerForm.watch("password") ?? "";
  const passwordStrength = getPasswordStrength(watchedPassword);

  const onRegister = async (data: RegisterSchema) => {
    setIsLoading(true);
    try {
      const res = await authService.register(
        data.name,
        data.email,
        data.password
      );

      const store = useUserStore.getState();
      store.setTokens(res.accessToken, res.refreshToken);
      store.setUser(res.user);

      authContextLogin(res.user, res.accessToken, res.refreshToken);
      userStartsService.trackUserLogin();

      toast.success("Your journey starts now 🚀");
      navigate("/home");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-svh grid grid-cols-1 lg:grid-cols-3">
      {/* ===== LEFT PANEL ===== */}
      <div className="hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-green-10000 to-green-50 p-10">
        <h2 className="text-3xl font-bold mb-4 text-center">
          Become a Volunteer Today
        </h2>
        <p className="text-muted-foreground text-center max-w-sm">
          Create your account to join impactful events, connect with communities,
          and make a difference.
        </p>

        <div className="mt-8 w-full max-w-xs">
          <img
            src={volunteerImg}
            alt="Volunteer illustration"
            className="w-full object-contain"
          />
        </div>
      </div>

      {/* ===== CENTER (REGISTER FORM) ===== */}
      <div className="flex items-center justify-center px-6 lg:px-0">
        <div className="w-full max-w-sm p-6 md:p-10">
          {step === 1 && (
            <form
              onSubmit={registerForm.handleSubmit(onRegister)}
              className="flex flex-col gap-6"
            >
              <FieldGroup>
                <div className="flex flex-col items-center gap-1 text-center">
                  <h1 className="text-2xl font-bold">Create your account</h1>
                  <p className="text-muted-foreground text-sm">
                    It only takes a minute to get started
                  </p>
                </div>

                <Field>
                  <FieldLabel>Username</FieldLabel>
                  <Input
                    placeholder="John Doe"
                    {...registerForm.register("name")}
                    required
                  />
                  {registerForm.formState.errors.name && (
                    <p className="text-sm text-red-600">
                      {registerForm.formState.errors.name.message}
                    </p>
                  )}
                </Field>

                <Field>
                  <FieldLabel>Email</FieldLabel>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    {...registerForm.register("email")}
                    required
                  />
                  {registerForm.formState.errors.email && (
                    <p className="text-sm text-red-600">
                      {registerForm.formState.errors.email.message}
                    </p>
                  )}
                </Field>

                <Field>
                  <FieldLabel>Password</FieldLabel>
                  <Input
                    type="password"
                    placeholder="Create a strong password"
                    {...registerForm.register("password")}
                    required
                  />
                  {watchedPassword && (
                    <div className="space-y-2 pt-2">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${passwordStrength.color}`}
                          style={{ width: `${passwordStrength.strength}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Strength:{" "}
                        <span className="font-medium">
                          {passwordStrength.label}
                        </span>
                      </p>
                    </div>
                  )}
                </Field>

                <Field>
                  <FieldLabel>Confirm Password</FieldLabel>
                  <Input
                    type="password"
                    placeholder="Confirm your password"
                    {...registerForm.register("confirmPassword")}
                    required
                  />
                  {registerForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-600">
                      {registerForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </Field>

                <Field>
                  <Button
                    type="submit"
                    className="w-full bg-[#43A047] hover:bg-[#388E3C]"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </Field>

                <Field>
                  <FieldDescription className="text-center">
                    Already have an account?{" "}
                    <a href="/login" className="underline underline-offset-4">
                      Sign in
                    </a>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-6 text-center">
              <Check className="mx-auto size-12 text-green-600" />
              <h1 className="text-2xl font-bold">Welcome aboard 🎉</h1>
              <p className="text-muted-foreground">
                Your account is ready. Let’s start making an impact!
              </p>
              <Button asChild>
                <a href="/login">Go to Login</a>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ===== RIGHT PANEL ===== */}
      <div className="hidden lg:flex flex-col justify-center items-center bg-muted/30 p-10">
        <blockquote className="max-w-sm text-center">
          <p className="text-lg font-medium">
            “Volunteers do not necessarily have the time; they just have the
            heart.”
          </p>
          <footer className="mt-4 text-sm text-muted-foreground">
            — Elizabeth Andrew —
          </footer>
        </blockquote>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Check, Eye, EyeOff } from "lucide-react";
// import illustration from "@/assets/login-illustration.png"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
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
// import Logo from "@/assets/logo.svg?react"

export default function SignupPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({
    register: false,
    confirm: false,
  });
  const navigate = useNavigate();

  // const [pendingEmail, setPendingEmail] = useState<string>("");

  // === Register Form ===
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
  const passwordStrength = getPasswordStrength(watchedPassword || "");

  const onRegister = async (data: RegisterSchema) => {
    setIsLoading(true);
    try {
      const res = await authService.register(
        data.name,
        data.email,
        data.password
      );
      console.log(res);
      const store = useUserStore.getState();
      
      store.setTokens(res.accessToken, res.refreshToken);
      store.setUser(res.user);

      // setPendingEmail(payload.email);
      // setStep(2);
      //toast.success("Account created successfully! Welcome!");
      navigate("/dashboard");
    } catch (error: any) {
        console.log(error);
      //   toast.error(
      //     error?.response?.data?.message ||
      //       "Registration failed. Please try again."
      //   );
    } finally {
      setIsLoading(false);
    }
  };

  // TODO
  //   const verifyOtp = async (otp: string) => {
  //     setError("");
  //     const res = await fetch("http://localhost:8000/register/verify", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ email: pendingEmail, otp }),
  //     });
  //     const data = await res.json();
  //     if (!res.ok) throw new Error(data.detail || "OTP verify failed");

  //     setStep(3);
  //   };

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            {/* <div className="h-12 w-auto overflow-hidden flex items-center">
              <Logo className="h-12 w-auto text-foreground transition-colors" preserveAspectRatio="xMidYMid meet" />
            </div> */}
          </a>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            {step === 1 && (
              <form
                onSubmit={registerForm.handleSubmit(onRegister)}
                className={"flex flex-col gap-6"}
              >
                <FieldGroup>
                  <div className="flex flex-col items-center gap-1 text-center">
                    <h1 className="text-2xl font-bold">Create your account</h1>
                    <p className="text-muted-foreground text-sm text-balance">
                      Fill in the form below to create your account
                    </p>
                  </div>

                  <Field>
                    <FieldLabel htmlFor="register-name">Username</FieldLabel>
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="John Doe"
                      {...registerForm.register("name")}
                      aria-invalid={!!registerForm.formState.errors.name}
                      required
                    />
                    {registerForm.formState.errors.name && (
                      <p className="text-sm text-red-600">
                        {registerForm.formState.errors.name.message}
                      </p>
                    )}
                    <FieldDescription>
                      5-12 characters. Only lowercase letters, numbers, dots
                      (.), and underscores (_).
                    </FieldDescription>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="you@example.com"
                      {...registerForm.register("email")}
                      aria-invalid={!!registerForm.formState.errors.email}
                      required
                    />
                    {registerForm.formState.errors.email && (
                      <p className="text-sm text-red-600">
                        {registerForm.formState.errors.email.message}
                      </p>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input
                      id="register-password"
                      type={showPassword.register ? "text" : "password"}
                      placeholder="Create a strong password"
                      {...registerForm.register("password")}
                      aria-invalid={!!registerForm.formState.errors.password}
                      required
                    />
                    {watchedPassword && (
                      <div className="space-y-2 pt-2">
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${passwordStrength.color}`}
                            style={{
                              width: `${passwordStrength.strength}%`,
                            }}
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

                    {registerForm.formState.errors.password && (
                      <p className="text-sm text-red-600">
                        {registerForm.formState.errors.password.message}
                      </p>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="confirmPassword">
                      Confirm Password
                    </FieldLabel>
                    <Input
                      id="register-confirm-password"
                      type={showPassword.confirm ? "text" : "password"}
                      placeholder="Confirm your password"
                      {...registerForm.register("confirmPassword")}
                      aria-invalid={
                        !!registerForm.formState.errors.confirmPassword
                      }
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

                  <FieldSeparator>Or continue with</FieldSeparator>

                  <Field>
                    <Button variant="outline" type="button">
                      Sign up with Google
                    </Button>
                    <FieldDescription className="px-6 text-center">
                      Already have an account? <a href="/login">Sign in</a>
                    </FieldDescription>
                  </Field>
                </FieldGroup>
              </form>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="flex size-16 items-center justify-center rounded-full bg-green-100">
                    <Check className="size-8 text-green-600" />
                  </div>
                  <h1 className="text-2xl font-bold">Account Created</h1>
                  <p className="text-muted-foreground text-sm text-balance">
                    Your account has been successfully created. Welcome to
                    Signlish!
                  </p>
                </div>
                <Button asChild className="w-full">
                  <a href="/login">Sign In</a>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* <div className="bg-muted relative hidden lg:block">
        <img src={illustration} alt="Image" className="absolute inset-0 h-full w-full object-cover" />
      </div> */}
    </div>
  );
}

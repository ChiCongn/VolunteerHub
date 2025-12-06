import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "../components/ui/tabs";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Eye, EyeOff } from "lucide-react";
import { authService } from "../services/authService";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginSchema } from "../schemas/auth/login.schema";
import {
    registerSchema,
    type RegisterSchema,
} from "../schemas/auth/register.schema";
import { useUserStore } from "../stores/user.store";

export function LoginRegister() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    // showPassword per-field
    const [showPassword, setShowPassword] = useState({
        login: false,
        register: false,
        confirm: false,
    });

    // === Login Form ===
    const loginForm = useForm<LoginSchema>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    });

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

    // === Password Strength ===
    const watchedPassword = registerForm.watch("password") ?? "";

    const getPasswordStrength = (password: string) => {
        if (!password) return { strength: 0, label: "", color: "bg-gray-300" };

        let strength = 0;
        if (password.length >= 8) strength += 25;
        if (/[a-z]/.test(password)) strength += 25;
        if (/[A-Z]/.test(password)) strength += 25;
        if (/[0-9]/.test(password)) strength += 25;

        if (strength < 50)
            return { strength, label: "Weak", color: "bg-[#F44336]" };
        if (strength < 75)
            return { strength, label: "Fair", color: "bg-[#FFC107]" };
        if (strength < 100)
            return { strength, label: "Good", color: "bg-[#43A047]" };
        return { strength: 100, label: "Strong", color: "bg-[#43A047]" };
    };

    const passwordStrength = getPasswordStrength(watchedPassword || "");

    // === Handlers ===
    const onLogin = async (data: LoginSchema) => {
        setIsLoading(true);
        try {
            const res = await authService.login(data.email, data.password);
            const store = useUserStore.getState();

            store.setTokens(res.accessToken, res.refreshToken);
            store.updateUser(res.user);
            toast.success("Welcome back to VolunteerHub!");
            navigate("/dashboard");
        } catch (error: any) {
            toast.error(
                error?.response?.data?.message ||
                    "Login failed. Please check your credentials."
            );
        } finally {
            setIsLoading(false);
        }
    };

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
            store.updateUser(res.user);
            toast.success("Account created successfully! Welcome!");
            navigate("/dashboard");
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
        <div className="min-h-screen flex">
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                <ImageWithFallback
                    src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200"
                    alt="Volunteers working together"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-[#43A047]/90 to-[#2196F3]/90 flex items-center justify-center p-12">
                    <div className="text-white space-y-6 max-w-md">
                        <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center">
                            <span className="text-[#43A047] text-2xl font-semibold">
                                VH
                            </span>
                        </div>
                        <h1 className="text-4xl text-white">
                            Welcome to VolunteerHub
                        </h1>
                        <p className="text-xl text-white/90">
                            Connect with your community, discover meaningful
                            volunteer opportunities, and make a difference
                            together.
                        </p>
                        <div className="space-y-3 pt-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                    <span className="text-white">✓</span>
                                </div>
                                <p className="text-white/90">
                                    Find events that match your interests
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                    <span className="text-white">✓</span>
                                </div>
                                <p className="text-white/90">
                                    Track your volunteer hours and impact
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                    <span className="text-white">✓</span>
                                </div>
                                <p className="text-white/90">
                                    Connect with like-minded volunteers
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:hidden">
                        <div className="inline-flex w-16 h-16 bg-[#43A047] rounded-lg items-center justify-center mb-4">
                            <span className="text-white text-2xl font-semibold">
                                VH
                            </span>
                        </div>
                        <h2 className="text-[#43A047]">VolunteerHub</h2>
                    </div>

                    <Tabs defaultValue="login" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="login">Login</TabsTrigger>
                            <TabsTrigger value="register">Register</TabsTrigger>
                        </TabsList>

                        <TabsContent value="login" className="space-y-4">
                            <form
                                onSubmit={loginForm.handleSubmit(onLogin)}
                                className="space-y-4"
                            >
                                <div className="space-y-2">
                                    <Label htmlFor="login-email">Email</Label>
                                    <Input
                                        id="login-email"
                                        type="email"
                                        placeholder="you@example.com"
                                        {...loginForm.register("email")}
                                        aria-invalid={
                                            !!loginForm.formState.errors.email
                                        }
                                    />
                                    {loginForm.formState.errors.email && (
                                        <p className="text-sm text-red-600">
                                            {
                                                loginForm.formState.errors.email
                                                    .message
                                            }
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="login-password">
                                        Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="login-password"
                                            type={
                                                showPassword.login
                                                    ? "text"
                                                    : "password"
                                            }
                                            placeholder="••••••••"
                                            {...loginForm.register("password")}
                                            aria-invalid={
                                                !!loginForm.formState.errors
                                                    .password
                                            }
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-0 top-0 h-full"
                                            aria-label={
                                                showPassword.login
                                                    ? "Hide password"
                                                    : "Show password"
                                            }
                                            onClick={() =>
                                                setShowPassword((s) => ({
                                                    ...s,
                                                    login: !s.login,
                                                }))
                                            }
                                        >
                                            {showPassword.login ? (
                                                <EyeOff className="w-4 h-4" />
                                            ) : (
                                                <Eye className="w-4 h-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-[#43A047] hover:bg-[#388E3C]"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Signing in..." : "Login"}
                                </Button>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="w-full"
                                >
                                    Forgot password?
                                </Button>
                            </form>
                        </TabsContent>

                        <TabsContent value="register" className="space-y-4">
                            <form
                                onSubmit={registerForm.handleSubmit(onRegister)}
                                className="space-y-4"
                            >
                                <div className="space-y-2">
                                    <Label htmlFor="register-name">
                                        Username
                                    </Label>
                                    <Input
                                        id="register-name"
                                        type="text"
                                        placeholder="John Doe"
                                        {...registerForm.register("name")}
                                        aria-invalid={
                                            !!registerForm.formState.errors.name
                                        }
                                    />
                                    {registerForm.formState.errors.name && (
                                        <p className="text-sm text-red-600">
                                            {
                                                registerForm.formState.errors
                                                    .name.message
                                            }
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="register-email">
                                        Email
                                    </Label>
                                    <Input
                                        id="register-email"
                                        type="email"
                                        placeholder="you@example.com"
                                        {...registerForm.register("email")}
                                        aria-invalid={
                                            !!registerForm.formState.errors
                                                .email
                                        }
                                    />
                                    {registerForm.formState.errors.email && (
                                        <p className="text-sm text-red-600">
                                            {
                                                registerForm.formState.errors
                                                    .email.message
                                            }
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="register-password">
                                        Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="register-password"
                                            type={
                                                showPassword.register
                                                    ? "text"
                                                    : "password"
                                            }
                                            placeholder="Create a strong password"
                                            {...registerForm.register(
                                                "password"
                                            )}
                                            aria-invalid={
                                                !!registerForm.formState.errors
                                                    .password
                                            }
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-0 top-0 h-full"
                                            aria-label={
                                                showPassword.register
                                                    ? "Hide password"
                                                    : "Show password"
                                            }
                                            onClick={() =>
                                                setShowPassword((s) => ({
                                                    ...s,
                                                    register: !s.register,
                                                }))
                                            }
                                        >
                                            {showPassword.register ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>

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
                                            {
                                                registerForm.formState.errors
                                                    .password.message
                                            }
                                        </p>
                                    )}

                                    <Label htmlFor="register-confirm-password">
                                        Confirm Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="register-confirm-password"
                                            type={
                                                showPassword.confirm
                                                    ? "text"
                                                    : "password"
                                            }
                                            placeholder="Confirm your password"
                                            {...registerForm.register(
                                                "confirmPassword"
                                            )}
                                            aria-invalid={
                                                !!registerForm.formState.errors
                                                    .confirmPassword
                                            }
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-0 top-0 h-full"
                                            aria-label={
                                                showPassword.confirm
                                                    ? "Hide confirm password"
                                                    : "Show confirm password"
                                            }
                                            onClick={() =>
                                                setShowPassword((s) => ({
                                                    ...s,
                                                    confirm: !s.confirm,
                                                }))
                                            }
                                        >
                                            {showPassword.confirm ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </Button>
                                        {registerForm.formState.errors
                                            .confirmPassword && (
                                            <p className="text-sm text-red-600">
                                                {
                                                    registerForm.formState
                                                        .errors.confirmPassword
                                                        .message
                                                }
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-[#43A047] hover:bg-[#388E3C]"
                                    disabled={isLoading}
                                >
                                    {isLoading
                                        ? "Creating account..."
                                        : "Create Account"}
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}

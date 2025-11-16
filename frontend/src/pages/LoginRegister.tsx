import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "../components/ui/tabs";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Eye, EyeOff } from "lucide-react";

export function LoginRegister() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    const [registerName, setRegisterName] = useState("");
    const [registerEmail, setRegisterEmail] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");
    const [registerRole, setRegisterRole] = useState("volunteer");

    // add library to check name + email + password.
    // check name length > 2
    // validate email
    // check match password - confirm password
    const getPasswordStrength = (password: string) => {
        if (password.length === 0) return { strength: 0, label: "" };
        if (password.length < 6)
            return { strength: 33, label: "Weak", color: "bg-[#F44336]" };
        if (password.length < 10)
            return { strength: 66, label: "Medium", color: "bg-[#FFC107]" };
        return { strength: 100, label: "Strong", color: "bg-[#43A047]" };
    };

    const passwordStrength = getPasswordStrength(registerPassword);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // will call login
    };

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        // register
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
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="login-email">Email</Label>
                                    <Input
                                        id="login-email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={loginEmail}
                                        onChange={(e) =>
                                            setLoginEmail(e.target.value)
                                        }
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="login-password">
                                        Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="login-password"
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            placeholder="••••••••"
                                            value={loginPassword}
                                            onChange={(e) =>
                                                setLoginPassword(e.target.value)
                                            }
                                            required
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-0 top-0 h-full"
                                            onClick={() =>
                                                setShowPassword(!showPassword)
                                            }
                                        >
                                            {showPassword ? (
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
                                >
                                    Login
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
                                onSubmit={handleRegister}
                                className="space-y-4"
                            >
                                <div className="space-y-2">
                                    <Label htmlFor="register-name">
                                        Full Name
                                    </Label>
                                    <Input
                                        id="register-name"
                                        type="text"
                                        placeholder="John Doe"
                                        value={registerName}
                                        onChange={(e) =>
                                            setRegisterName(e.target.value)
                                        }
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="register-email">
                                        Email
                                    </Label>
                                    <Input
                                        id="register-email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={registerEmail}
                                        onChange={(e) =>
                                            setRegisterEmail(e.target.value)
                                        }
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="register-password">
                                        Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="register-password"
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            placeholder="••••••••"
                                            value={registerPassword}
                                            onChange={(e) =>
                                                setRegisterPassword(
                                                    e.target.value
                                                )
                                            }
                                            required
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-0 top-0 h-full"
                                            onClick={() =>
                                                setShowPassword(!showPassword)
                                            }
                                        >
                                            {showPassword ? (
                                                <EyeOff className="w-4 h-4" />
                                            ) : (
                                                <Eye className="w-4 h-4" />
                                            )}
                                        </Button>
                                    </div>
                                    {registerPassword && (
                                        <div className="space-y-1">
                                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all ${passwordStrength.color}`}
                                                    style={{
                                                        width: `${passwordStrength.strength}%`,
                                                    }}
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Password strength:{" "}
                                                {passwordStrength.label}
                                            </p>
                                        </div>
                                    )}
                                    <Label htmlFor="register-password">
                                        Confirm Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="register-password"
                                            type={
                                                showConfirmPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            placeholder="••••••••"
                                            required
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-0 top-0 h-full"
                                            onClick={() =>
                                                setShowConfirmPassword(
                                                    !showConfirmPassword
                                                )
                                            }
                                        >
                                            {showConfirmPassword ? (
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
                                >
                                    Sign Up
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}

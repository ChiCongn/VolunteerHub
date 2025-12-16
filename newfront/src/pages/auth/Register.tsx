import { useState } from "react"
import { Check } from "lucide-react"
// import illustration from "@/assets/login-illustration.png"
import { SignupForm, type RegisterInitPayload } from "@/components/signup-form"
import { Button } from "@/components/ui/button"
// import Logo from "@/assets/logo.svg?react"

export default function SignupPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [pendingEmail, setPendingEmail] = useState<string>("")
  const [error, setError] = useState<string>("")

  const initiateRegister = async (payload: RegisterInitPayload) => {
    setError("")
    const res = await fetch("http://localhost:8000/register/initiate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.detail || "Register initiate failed")

    setPendingEmail(payload.email)
    setStep(2)
  }

  const verifyOtp = async (otp: string) => {
    setError("")
    const res = await fetch("http://localhost:8000/register/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: pendingEmail, otp }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.detail || "OTP verify failed")

    setStep(3)
  }

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
            {error && <p className="text-red-600 mb-3 text-center">{error}</p>}

            {step === 1 && (
              <SignupForm
                onSubmit={(data) => {
                  initiateRegister(data).catch((e) => setError(String(e.message || e)))
                }}
              />
            )}

            {step === 2 && (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="flex size-16 items-center justify-center rounded-full bg-green-100">
                    <Check className="size-8 text-green-600" />
                  </div>
                  <h1 className="text-2xl font-bold">Account Created</h1>
                  <p className="text-muted-foreground text-sm text-balance">
                    Your account has been successfully created. Welcome to Signlish!
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
  )
}

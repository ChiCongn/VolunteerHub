import { useState } from "react"
import { useNavigate } from "react-router-dom"
// import illustration from "@/assets/login-illustration.png"
import { LoginForm } from "@/components/login-form"
// import Logo from "@/assets/logo.svg?react"

type LoginPayload = {
  identifier: string
  password: string
}

export default function LoginPage() {
  const [error, setError] = useState<string>("")
  const navigate = useNavigate()

  const handleLogin = async (payload: LoginPayload) => {
    try {
      setError("")

      const res = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || "Login failed")

      // BE trả access_token + user
      localStorage.setItem("access_token", data.access_token)
      localStorage.setItem("user", JSON.stringify(data.user))

      navigate("/")
    } catch (e: any) {
      setError(e?.message || "Login failed")
    }
  }

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
            {error && <p className="text-red-600 mb-3 text-center">{error}</p>}
            <LoginForm onSubmit={handleLogin} />
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
  )
}

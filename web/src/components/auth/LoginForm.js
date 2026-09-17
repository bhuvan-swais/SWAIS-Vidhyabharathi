"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, clearError } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    const result = await login(email, password);
    // Redirecting to the new multi-tenant Acharya layout
    if (result.success) router.push("/acharya");
  };

  return (
    <div className="w-full max-w-md animate-fade-in font-inter">
      {/* Logo & Branding */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl ai-gradient text-white text-2xl font-black mb-4 shadow-lg pulse-glow">
          VB
        </div>
        <h1 className="text-3xl font-black mb-1 ai-gradient-text" style={{ fontFamily: "var(--font-space-grotesk)" }}>
          VidhyaBharathi
        </h1>
        <p className="text-sm font-bold text-stone-400">
          Acharya Portal (अचार्य-द्वारम्)
        </p>
      </div>

      {/* Login Card */}
      <div className="bg-white rounded-2xl shadow-[0_8px_32px_rgba(234,88,12,0.12)] p-8 border border-orange-100 relative overflow-hidden">
        {/* subtle gradient bar at top */}
        <div className="absolute top-0 left-0 right-0 h-1 ai-gradient rounded-t-2xl" />

        <h2 className="text-xl font-black mt-1 mb-0.5 text-stone-900" style={{ fontFamily: "var(--font-space-grotesk)" }}>
          पुनर्स्वागतम् 👋
        </h2>
        <p className="text-sm mb-6 text-stone-400 font-medium">
          Sign in to your Acharya dashboard
        </p>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl text-sm font-bold flex items-center gap-2 animate-scale-in"
            style={{ background: "#FEF2F2", color: "#EF4444" }}>
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label htmlFor="login-email" className="block text-sm font-extrabold mb-1.5 text-stone-700">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="acharya@vidhyabharathi.edu"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 focus:outline-none"
                style={{
                  border: "1.5px solid #E7E5E4",
                  color: "#1C1917",
                  background: "#FAFAFA",
                }}
                onFocus={e => { e.target.style.border = "1.5px solid #EA580C"; e.target.style.boxShadow = "0 0 0 3px rgba(234,88,12,0.12)"; }}
                onBlur={e => { e.target.style.border = "1.5px solid #E7E5E4"; e.target.style.boxShadow = "none"; }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="login-password" className="block text-sm font-extrabold mb-1.5 text-stone-700">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full pl-10 pr-11 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 focus:outline-none"
                style={{
                  border: "1.5px solid #E7E5E4",
                  color: "#1C1917",
                  background: "#FAFAFA",
                }}
                onFocus={e => { e.target.style.border = "1.5px solid #EA580C"; e.target.style.boxShadow = "0 0 0 3px rgba(234,88,12,0.12)"; }}
                onBlur={e => { e.target.style.border = "1.5px solid #E7E5E4"; e.target.style.boxShadow = "none"; }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer transition-colors text-stone-400"
                onMouseEnter={e => e.currentTarget.style.color = "#EA580C"}
                onMouseLeave={e => e.currentTarget.style.color = "#A8A29E"}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded" style={{ accentColor: "#EA580C" }} />
              <span className="text-xs font-bold text-stone-500">Remember me</span>
            </label>
            <a href="#" className="text-xs font-extrabold transition-colors text-orange-600"
              onMouseEnter={e => e.currentTarget.style.color = "#C2410C"}
              onMouseLeave={e => e.currentTarget.style.color = "#EA580C"}>
              Forgot password?
            </a>
          </div>

          {/* Submit */}
          <Button type="submit" loading={isLoading} className="w-full bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 border-none text-white shadow-md" size="lg" id="login-submit-btn">
            {isLoading ? "Signing in…" : "प्रविशतु (Sign In) →"}
          </Button>
        </form>
      </div>

      {/* Footer */}
      <p className="text-center text-xs mt-6 font-semibold text-stone-400">
        © 2026 VidhyaBharathi. All rights reserved.
      </p>
    </div>
  );
}
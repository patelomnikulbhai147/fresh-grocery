"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, Mail, Key, AlertCircle, ArrowRight, CheckCircle2, Eye, EyeOff, Sparkles, RefreshCw } from "lucide-react";
import { useAdminAuth } from "@/store/adminAuth";
import { useToasts } from "@/store/shop";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, verify2FA, twoFactorPending, lockoutUntil, loginAttempts } = useAdminAuth();
  const pushToast = useToasts((s) => s.push);

  const [email, setEmail] = useState("9773271029");
  const [password, setPassword] = useState("Admin@12345");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [otpPin, setOtpPin] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutUntil && Date.now() < lockoutUntil) {
      const remainingSec = Math.ceil((lockoutUntil - Date.now()) / 1000);
      pushToast(`Too many failed attempts. Try again in ${remainingSec}s`, "error");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = login(email, password, rememberMe);
      setIsSubmitting(false);

      if (res.success) {
        if (res.require2FA) {
          pushToast("Credentials verified. Please enter your 2FA TOTP code.", "info");
        } else {
          pushToast("Welcome back, Super Admin!", "success");
          router.push("/admin");
        }
      } else {
        pushToast(res.message, "error");
      }
    }, 600);
  };

  const handle2FASubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpPin || otpPin.length < 4) {
      pushToast("Please enter a valid 6-digit TOTP code (Hint: enter 123456)", "info");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = verify2FA(otpPin);
      setIsSubmitting(false);

      if (res.success) {
        pushToast("2FA verified! Access granted to Enterprise Portal.", "success");
        router.push("/admin");
      } else {
        pushToast(res.message, "error");
      }
    }, 500);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      pushToast("Please enter your registered admin email address", "info");
      return;
    }
    pushToast(`Password reset link sent to ${forgotEmail}. Please check your secure admin inbox.`, "success");
    setIsForgotOpen(false);
    setForgotEmail("");
  };

  const isLocked = lockoutUntil && Date.now() < lockoutUntil;

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-950 via-zinc-900 to-brand-900 flex items-center justify-center p-4 md:p-8 text-white relative overflow-hidden">
      {/* Decorative Ambient Gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full z-10 space-y-6 animate-in fade-in zoom-in-95 duration-500">
        {/* Brand Logo & Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 bg-white/10 dark:bg-zinc-800/80 px-4 py-2 rounded-2xl backdrop-blur-md border border-white/10 hover:border-white/30 transition shadow-lg">
            <span className="text-2xl">⚡</span>
            <span className="font-display font-extrabold text-xl tracking-tight bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
              FlashKart Admin
            </span>
          </Link>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-white mt-4">
            {twoFactorPending ? "Two-Factor Verification" : "FlashKart Admin Portal"}
          </h1>
          <p className="text-xs text-zinc-400">
            {twoFactorPending
              ? "Enter your 6-digit TOTP authenticator code to proceed"
              : "Secure access restricted to authorized management personnel"}
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-zinc-900/90 border border-white/15 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl space-y-6 relative">
          {twoFactorPending ? (
            /* 2FA Form */
            <form onSubmit={handle2FASubmit} className="space-y-5">
              <div className="space-y-2 text-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 grid place-items-center mx-auto border border-emerald-500/30">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold text-white">Two-Factor Authenticator</div>
                <div className="text-xs text-zinc-400">
                  Open your authenticator app (Google Authenticator / Authy) and enter the 6-digit code for <strong>+91 9773271029 / admin@flashkart.co</strong>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-zinc-300 text-center">6-Digit TOTP PIN</label>
                <div className="relative max-w-[220px] mx-auto">
                  <Key className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={otpPin}
                    onChange={(e) => setOtpPin(e.target.value.replace(/\D/g, ""))}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/40 border border-white/20 focus:border-emerald-400 text-center font-mono text-lg tracking-widest text-white outline-none transition"
                  />
                </div>
                <div className="text-[10px] text-zinc-500 text-center pt-1">
                  💡 Dev environment shortcut: Enter <strong>123456</strong>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || otpPin.length < 4}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 font-bold text-sm shadow-glow-cta transition flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Verifying 2FA Token...
                  </>
                ) : (
                  <>
                    <span>Verify & Login</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Standard Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-zinc-300">Admin Mobile Number or Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="9773271029 or admin@flashkart.co"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/30 border border-white/15 focus:border-purple-400 text-xs text-white outline-none transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-zinc-300">Password</label>
                  <button
                    type="button"
                    onClick={() => setIsForgotOpen(true)}
                    className="text-brand-400 hover:underline text-[11px]"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-black/30 border border-white/15 focus:border-brand-400 text-xs text-white outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-white/20 bg-black/40 text-brand-500 focus:ring-0 w-3.5 h-3.5"
                  />
                  <span>Remember session for 7 days</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !!isLocked}
                className={cn(
                  "w-full py-3.5 rounded-2xl font-bold text-sm shadow-lg transition flex items-center justify-center gap-2 active:scale-95",
                  isLocked
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 cursor-not-allowed"
                    : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-glow-cta"
                )}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Authenticating...
                  </>
                ) : isLocked ? (
                  <>
                    <AlertCircle className="w-4 h-4" /> Account Temporarily Locked
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Login to Enterprise Dashboard</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick Demo Login Credentials Card */}
          <div className="p-4 rounded-2xl bg-black/30 border border-white/10 text-zinc-300 text-xs space-y-2">
            <div className="font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Admin Credentials Reference:
            </div>
            <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
              <div className="p-2 rounded bg-white/5 truncate" title="9773271029 or admin@flashkart.co">
                <span className="text-zinc-400 block text-[9px]">MOBILE / EMAIL:</span>
                9773271029
              </div>
              <div className="p-2 rounded bg-white/5 truncate">
                <span className="text-zinc-400 block text-[9px]">PASSWORD / OTP:</span>
                Admin@12345
              </div>
            </div>
            <div className="text-[10px] text-zinc-400 text-center">
              Role: <strong className="text-emerald-400">Super Admin (All Permissions)</strong> · 2FA PIN: <strong className="text-teal-400">123456</strong>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-zinc-400 space-y-2">
          <div>Protected by Cloudflare Turnstile & FlashKart Shield WAF.</div>
          <Link href="/" className="inline-block text-amber-300 hover:underline">
            ← Return to Storefront Homepage
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
          <div className="bg-zinc-900 border border-white/20 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl text-white">
            <h3 className="font-display font-bold text-lg flex items-center gap-2">
              <Key className="w-5 h-5 text-brand-400" /> Reset Administrative Password
            </h3>
            <p className="text-xs text-zinc-400">
              Enter your registered enterprise email address. We will send a secure tokenized recovery link valid for 15 minutes.
            </p>
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="admin@flashkart.co"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/20 text-xs text-white outline-none"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsForgotOpen(false)}
                  className="px-4 py-2 rounded-xl border border-white/20 text-xs font-semibold hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-xs font-bold shadow-md transition"
                >
                  Send Reset Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

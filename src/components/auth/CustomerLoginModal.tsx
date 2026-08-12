"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Phone,
  CheckCircle2,
  RefreshCw,
  User,
} from "lucide-react";
import { useCustomerAuth } from "@/store/customerAuth";
import { useWishlist, useToasts, useCart } from "@/store/shop";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

// ──────────────────── OTP Timer Hook ────────────────────
function useOtpTimer(initialSeconds: number) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [running, setRunning] = useState(false);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback((s = initialSeconds) => {
    setSeconds(s);
    setRunning(true);
  }, [initialSeconds]);

  useEffect(() => {
    if (running && seconds > 0) {
      ref.current = setInterval(() => setSeconds((s) => s - 1), 1000);
    }
    if (seconds === 0) setRunning(false);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [running, seconds]);

  const formatted = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  return { seconds, running, start, formatted };
}

// ──────────────────── OTP Input ────────────────────
function OtpInput({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !inputRefs.current[i]?.value && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
  };

  const handleChange = (i: number, v: string) => {
    if (!/^\d*$/.test(v)) return;
    const chars = value.split("");
    chars[i] = v.slice(-1);
    const next = chars.join("");
    onChange(next.padEnd(6, " ").slice(0, 6).trimEnd());
    if (v && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted) {
      onChange(pasted);
      inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    }
  };

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {Array.from({ length: 6 }, (_, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] ?? ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKey(i, e)}
          disabled={disabled}
          className={cn(
            "w-11 h-12 text-center text-xl font-bold border-2 rounded-xl outline-none transition-all",
            "border-brand-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200",
            value[i] ? "bg-brand-50 border-brand-400" : "bg-white",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        />
      ))}
    </div>
  );
}

// ──────────────────── Main Modal ────────────────────
export function CustomerLoginModal() {
  const router = useRouter();
  const {
    isLoginModalOpen,
    closeLoginModal,
    login,
    pendingAction,
    redirectAfterLogin,
    clearPendingAction,
    loginStep,
    setLoginStep,
    pendingMobile,
    setPendingMobile,
  } = useCustomerAuth();

  const toggleWishlist = useWishlist((s) => s.toggle);
  const pushToast = useToasts((s) => s.push);

  // Mobile step state
  const [mobile, setMobile] = useState("");
  const [mobileError, setMobileError] = useState("");

  // OTP step state
  const [otpValue, setOtpValue] = useState("");
  const [otpError, setOtpError] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const timer = useOtpTimer(5 * 60);

  // Register step state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [regError, setRegError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState("");

  // Reset everything when modal closes
  useEffect(() => {
    if (!isLoginModalOpen) {
      setMobile("");
      setMobileError("");
      setOtpValue("");
      setOtpError("");
      setDevOtp(null);
      setFullName("");
      setEmail("");
      setGender("");
      setDob("");
      setReferralCode("");
      setRegError("");
      setGeneralError("");
      setIsSubmitting(false);
    }
  }, [isLoginModalOpen]);

  if (!isLoginModalOpen) return null;

  // ── Step 1: Send OTP ──
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMobileError("");
    setGeneralError("");

    const cleaned = mobile.replace(/\s/g, "");
    if (!/^[6-9]\d{9}$/.test(cleaned)) {
      setMobileError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: cleaned }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMobileError(data.error ?? "Failed to send OTP.");
        return;
      }

      setPendingMobile(cleaned);
      setOtpValue("");
      setOtpError("");
      timer.start(5 * 60);
      setLoginStep("otp");

      // Show OTP in dev mode (dev helper)
      if (data._devOtp) {
        setDevOtp(data._devOtp);
      }
    } catch {
      setGeneralError("Network error. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Step 2: Verify OTP ──
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError("");
    setGeneralError("");

    const cleaned = otpValue.replace(/\s/g, "");
    if (cleaned.length !== 6) {
      setOtpError("Please enter the 6-digit OTP.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: pendingMobile, otp: cleaned }),
      });
      const data = await res.json();

      if (!res.ok) {
        setOtpError(data.error ?? "Invalid OTP.");
        return;
      }

      if (data.status === "LOGIN") {
        // Existing customer — log them in immediately
        login(data.user);
        pushToast(`Welcome back, ${data.user.name}! 👋`, "success");
        handlePostLogin();
      } else if (data.status === "REGISTER") {
        // New customer — show registration form
        setLoginStep("register");
      }
    } catch {
      setGeneralError("Network error. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Step 3: Register ──
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");
    setGeneralError("");

    if (!fullName.trim() || fullName.trim().length < 2) {
      setRegError("Please enter your full name (at least 2 characters).");
      return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setRegError("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile: pendingMobile,
          fullName: fullName.trim(),
          email: email.trim() || undefined,
          gender: gender || undefined,
          dateOfBirth: dob || undefined,
          referralCode: referralCode.trim() || undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setRegError(data.error ?? "Registration failed.");
        return;
      }

      login(data.user);
      pushToast(`Account created! Welcome to FlashKart, ${data.user.name}! 🎉`, "success");
      handlePostLogin();
    } catch {
      setGeneralError("Network error. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Resend OTP ──
  const handleResendOtp = async () => {
    setOtpError("");
    setOtpValue("");
    setDevOtp(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: pendingMobile }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOtpError(data.error ?? "Failed to resend OTP.");
        return;
      }
      timer.start(5 * 60);
      pushToast("New OTP sent!", "info");
      if (data._devOtp) setDevOtp(data._devOtp);
    } catch {
      setOtpError("Network error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Post-login actions (cart merge, pending actions, redirect) ──
  const handlePostLogin = () => {
    closeLoginModal();

    // Handle pending action (e.g. wishlist)
    if (pendingAction?.type === "wishlist" && pendingAction.payload?.productId) {
      toggleWishlist(pendingAction.payload.productId);
      pushToast("Added to wishlist ❤️", "success");
    }

    // Guest cart merge toast
    setTimeout(() => pushToast("Guest cart synced to your account ✓", "info"), 600);

    // Redirect
    if (redirectAfterLogin) {
      router.push(redirectAfterLogin);
    }

    clearPendingAction();
  };

  // ── Step indicators ──
  const steps = ["mobile", "otp", "register"] as const;
  const currentStepIndex = steps.indexOf(loginStep as any);

  // ── Header text per step ──
  const headerText: Record<string, string> = {
    mobile: "Welcome to FlashKart",
    otp: "Verify Your Mobile",
    register: "Almost there! 🎉",
  };

  const subText: Record<string, string> = {
    mobile: "Enter your mobile to continue",
    otp: `OTP sent to +91 ${pendingMobile}`,
    register: "Just your name and you're in.",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-brand-950/60 backdrop-blur-sm"
        onClick={loginStep === "mobile" ? closeLoginModal : undefined}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Gradient Header */}
        <div className="relative bg-gradient-to-br from-brand-600 to-brand-800 p-6 pb-8 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/10 rounded-full blur-xl" />

          {/* Close */}
          <button
            onClick={closeLoginModal}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Back button (OTP / Register steps) */}
          {loginStep !== "mobile" && (
            <button
              onClick={() => setLoginStep(loginStep === "register" ? "otp" : "mobile")}
              className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-2 text-white/80 text-xs font-medium mb-2 mt-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Secure Passwordless Login
          </div>
          <h2 className="font-display font-bold text-2xl text-white leading-tight">
            {headerText[loginStep] ?? "Welcome"}
          </h2>
          <p className="text-white/70 text-sm mt-1">{subText[loginStep] ?? ""}</p>

          {/* Step dots */}
          {loginStep !== "mobile" && (
            <div className="flex gap-1.5 mt-4">
              {steps.map((s, i) => (
                <div
                  key={s}
                  className={cn(
                    "h-1 rounded-full transition-all duration-300",
                    i <= currentStepIndex ? "bg-white w-6" : "bg-white/30 w-3"
                  )}
                />
              ))}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-6">
          {generalError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 text-center">
              {generalError}
            </div>
          )}

          {/* ── STEP 1: Mobile Input ── */}
          {loginStep === "mobile" && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-brand-900 ml-1 mb-1.5 block">
                  Mobile Number
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 flex items-center gap-1.5 text-brand-700 font-semibold text-sm pointer-events-none">
                    <Phone className="w-4 h-4" />
                    <span>+91</span>
                    <span className="text-brand-300">|</span>
                  </div>
                  <input
                    type="tel"
                    required
                    autoFocus
                    placeholder="98765 43210"
                    value={mobile}
                    onChange={(e) => {
                      setMobile(e.target.value.replace(/\D/g, "").slice(0, 10));
                      setMobileError("");
                    }}
                    className={cn(
                      "w-full pl-20 pr-4 py-3.5 border-2 rounded-xl text-base outline-none transition-all",
                      mobileError
                        ? "border-rose-400 focus:ring-2 focus:ring-rose-200"
                        : "border-brand-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                    )}
                    disabled={isSubmitting}
                  />
                </div>
                {mobileError && (
                  <p className="text-xs text-rose-600 mt-1.5 ml-1">{mobileError}</p>
                )}
                <p className="text-xs text-brand-500 mt-1.5 ml-1">
                  We'll send a 6-digit OTP to this number
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || mobile.length !== 10}
                className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition"
              >
                {isSubmitting ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Get OTP <ArrowRight className="w-4 h-4" /></>
                )}
              </button>

              <div className="relative flex items-center my-4">
                <div className="flex-grow border-t border-brand-100" />
                <span className="mx-4 text-xs text-brand-400 font-semibold uppercase tracking-wider">OR</span>
                <div className="flex-grow border-t border-brand-100" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-brand-200 hover:bg-brand-50 rounded-xl text-sm font-semibold text-brand-900 transition"
                >
                  <img
                    src="https://www.svgrepo.com/show/475656/google-color.svg"
                    alt="Google"
                    className="w-4 h-4"
                  />
                  Google
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-brand-200 hover:bg-brand-50 rounded-xl text-sm font-semibold text-brand-900 transition"
                >
                  <img
                    src="https://www.svgrepo.com/show/511330/apple-173.svg"
                    alt="Apple"
                    className="w-4 h-4"
                  />
                  Apple
                </button>
              </div>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={closeLoginModal}
                  className="text-sm text-brand-500 hover:text-brand-800 font-medium"
                >
                  Skip and continue browsing
                </button>
              </div>
            </form>
          )}

          {/* ── STEP 2: OTP Verification ── */}
          {loginStep === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              {/* Dev mode OTP helper */}
              {devOtp && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center">
                  <p className="text-xs text-amber-700 font-semibold uppercase tracking-wider mb-0.5">
                    DEV MODE — Your OTP
                  </p>
                  <p className="text-2xl font-mono font-bold text-amber-800 tracking-[0.3em]">
                    {devOtp}
                  </p>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-brand-900 ml-1 mb-3 block text-center">
                  Enter the 6-digit OTP
                </label>
                <OtpInput
                  value={otpValue}
                  onChange={setOtpValue}
                  disabled={isSubmitting}
                />
                {otpError && (
                  <p className="text-xs text-rose-600 mt-2 text-center">{otpError}</p>
                )}
              </div>

              {/* Timer and Resend */}
              <div className="flex items-center justify-between text-sm">
                <span className={cn("font-mono", timer.seconds < 30 ? "text-rose-600" : "text-brand-600")}>
                  {timer.running ? `Expires in ${timer.formatted}` : "OTP expired"}
                </span>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={timer.running && timer.seconds > 0}
                  className="flex items-center gap-1 text-brand-600 hover:text-brand-800 font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Resend OTP
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || otpValue.replace(/\s/g, "").length !== 6}
                className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition"
              >
                {isSubmitting ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Verify OTP <CheckCircle2 className="w-4 h-4" /></>
                )}
              </button>
            </form>
          )}

          {/* ── STEP 3: Minimal Registration (Swiggy/Blinkit style) ── */}
          {loginStep === "register" && (
            <form onSubmit={handleRegister} className="space-y-5">
              {/* Verified mobile — read only */}
              <div className="flex items-center gap-3 p-3 bg-brand-50 border border-brand-100 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-brand-100 grid place-items-center shrink-0">
                  <Phone className="w-4 h-4 text-brand-600" />
                </div>
                <div>
                  <p className="text-[10px] text-brand-500 uppercase tracking-wider font-semibold">Verified Mobile</p>
                  <p className="text-sm font-bold text-brand-900">+91 {pendingMobile}</p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-brand-500 ml-auto" />
              </div>

              {regError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
                  {regError}
                </div>
              )}

              {/* Full Name — the ONLY required field */}
              <div>
                <label className="text-xs font-semibold text-brand-900 ml-1 mb-1.5 block">
                  What should we call you? <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" />
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="Your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-4 py-3.5 border-2 border-brand-200 rounded-xl outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 text-base transition"
                    disabled={isSubmitting}
                  />
                </div>
                <p className="text-xs text-brand-400 mt-1.5 ml-1">
                  This is how your name will appear on orders and invoices.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !fullName.trim()}
                className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition"
              >
                {isSubmitting ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Continue <ArrowRight className="w-4 h-4" /></>
                )}
              </button>

              <p className="text-[11px] text-center text-brand-400 leading-relaxed">
                By continuing, you agree to our{" "}
                <a href="/terms" className="text-brand-600 hover:underline" target="_blank">Terms</a>
                {" "}&{" "}
                <a href="/privacy" className="text-brand-600 hover:underline" target="_blank">Privacy Policy</a>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

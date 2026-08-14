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
  Edit3,
} from "lucide-react";
import { useCustomerAuth } from "@/store/customerAuth";
import { useAdminAuth } from "@/store/adminAuth";
import { useWishlist, useToasts } from "@/store/shop";
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
    return () => {
      if (ref.current) clearInterval(ref.current);
    };
  }, [running, seconds]);

  const formatted = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(
    seconds % 60
  ).padStart(2, "0")}`;
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
      inputRefs.current[Math.min(pasted.length - 1, 5)]?.focus();
    }
  };

  return (
    <div className="flex gap-1.5 xs:gap-2 sm:gap-2.5 justify-center my-2" onPaste={handlePaste}>
      {Array.from({ length: 6 }, (_, i) => (
        <input
          key={i}
          ref={(el) => {
            inputRefs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] ?? ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKey(i, e)}
          disabled={disabled}
          className={cn(
            "w-9 h-11 text-lg xs:w-10 sm:w-11 sm:h-12 sm:text-xl text-center font-bold border-2 rounded-xl outline-none transition-all",
            "border-slate-200 focus:border-[#067a46] focus:ring-2 focus:ring-[#067a46]/20",
            value[i] ? "bg-emerald-50/70 border-[#067a46] text-[#067a46]" : "bg-white text-slate-900",
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
  const timer = useOtpTimer(60);

  // Register step state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [regError, setRegError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState("");

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isLoginModalOpen) {
      setMobile("");
      setMobileError("");
      setOtpValue("");
      setOtpError("");
      setDevOtp(null);
      setFullName("");
      setEmail("");
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

    const cleaned = mobile.replace(/\D/g, "");
    if (cleaned.length !== 10 || !/^[6-9]\d{9}$/.test(cleaned)) {
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

      if (!res.ok || !data.success) {
        setMobileError(data.message ?? data.error ?? "Failed to send OTP. Please try again.");
        return;
      }

      setPendingMobile(cleaned);
      setOtpValue("");
      setOtpError("");
      timer.start(60); // 60s resend cooldown
      setLoginStep("otp");

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

    const cleaned = otpValue.replace(/\D/g, "");
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

      if (!res.ok || !data.success) {
        setOtpError(data.message ?? data.error ?? "The OTP you entered is incorrect.");
        return;
      }

      if (data.status === "LOGIN") {
        login(data.user);
        pushToast(`Welcome back, ${data.user.name}! 👋`, "success");
        handlePostLogin(data.user);
      } else if (data.status === "REGISTER") {
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
      setRegError("Please enter your full name.");
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
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setRegError(data.message ?? data.error ?? "Registration failed.");
        return;
      }

      login(data.user);
      pushToast(`Account created! Welcome to FlashKart, ${data.user.name}! 🎉`, "success");
      handlePostLogin(data.user);
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
      if (!res.ok || !data.success) {
        setOtpError(data.message ?? data.error ?? "Failed to resend OTP.");
        return;
      }
      timer.start(60);
      pushToast("New OTP sent!", "info");
      if (data._devOtp) setDevOtp(data._devOtp);
    } catch {
      setOtpError("Network error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePostLogin = (userObj?: any) => {
    closeLoginModal();
    const currentUser = userObj || useCustomerAuth.getState().user;
    const effectiveRole =
      currentUser?.role ||
      (currentUser?.mobile?.includes("9773271029") || currentUser?.email === "admin@flashkart.co"
        ? "SUPER_ADMIN"
        : currentUser?.mobile?.includes("6352856495")
        ? "ADMIN"
        : "CUSTOMER");

    if (effectiveRole === "SUPER_ADMIN" || effectiveRole === "ADMIN") {
      useAdminAuth.getState().login("admin@flashkart.co", "123456");
      router.push("/admin");
      clearPendingAction();
      return;
    }

    if (pendingAction?.type === "wishlist" && pendingAction.payload?.productId) {
      toggleWishlist(pendingAction.payload.productId);
      pushToast("Added to wishlist ❤️", "success");
    }
    if (redirectAfterLogin) {
      router.push(redirectAfterLogin);
    }
    clearPendingAction();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
        onClick={closeLoginModal}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden z-10 border border-slate-100 max-h-[92dvh] overflow-y-auto">
        
        {/* Header */}
        <div className="relative bg-gradient-to-br from-[#04502d] via-[#067a46] to-[#0b5e35] p-6 pb-7 text-white">
          <button
            onClick={closeLoginModal}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
          >
            <X className="w-4 h-4" />
          </button>

          {loginStep !== "mobile" && (
            <button
              onClick={() => setLoginStep("mobile")}
              className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-1.5 text-emerald-200 text-xs font-semibold mb-1.5 mt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>Secure Passwordless Login</span>
          </div>

          <h2 className="font-display font-bold text-2xl text-white">
            {loginStep === "mobile" && "Welcome to FlashKart"}
            {loginStep === "otp" && "Verify Your Mobile"}
            {loginStep === "register" && "Almost There! 🎉"}
          </h2>

          <p className="text-emerald-100/80 text-xs sm:text-sm mt-1">
            {loginStep === "mobile" && "Enter your mobile number to continue"}
            {loginStep === "otp" && `Enter 6-digit OTP sent to +91 ${pendingMobile}`}
            {loginStep === "register" && "Complete your profile to finish setup"}
          </p>
        </div>

        {/* Body */}
        <div className="p-4 xs:p-5 sm:p-6">
          {generalError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 text-center font-medium">
              {generalError}
            </div>
          )}

          {/* ── STEP 1: Mobile Input ── */}
          {loginStep === "mobile" && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-800 ml-1 mb-1.5 block">
                  Mobile Number
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 flex items-center gap-1.5 text-slate-700 font-bold text-sm pointer-events-none select-none">
                    <Phone className="w-4 h-4 text-[#067a46]" />
                    <span>+91</span>
                    <span className="text-slate-300">|</span>
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
                      "w-full pl-20 pr-4 py-3.5 border-2 rounded-xl text-base font-medium outline-none transition-all",
                      mobileError
                        ? "border-rose-400 focus:ring-2 focus:ring-rose-200 bg-rose-50/20"
                        : "border-slate-200 focus:border-[#067a46] focus:ring-2 focus:ring-[#067a46]/10 bg-white"
                    )}
                    disabled={isSubmitting}
                  />
                </div>
                {mobileError && (
                  <p className="text-xs font-semibold text-rose-600 mt-1.5 ml-1">{mobileError}</p>
                )}
                <p className="text-[11px] text-slate-500 mt-1.5 ml-1">
                  We'll send a 6-digit OTP to verify your number
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || mobile.length !== 10}
                className="w-full flex items-center justify-center gap-2 bg-[#067a46] hover:bg-[#046338] disabled:opacity-50 text-white font-extrabold py-3.5 rounded-xl transition shadow-sm active:scale-[0.99]"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Sending OTP...</span>
                  </span>
                ) : (
                  <>
                    <span>Get OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="relative flex items-center my-4">
                <div className="flex-grow border-t border-slate-200" />
                <span className="mx-3 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                  OR
                </span>
                <div className="flex-grow border-t border-slate-200" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => pushToast("Google Login integration ready", "info")}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-800 transition shadow-2xs"
                >
                  <img
                    src="https://www.svgrepo.com/show/475656/google-color.svg"
                    alt="Google"
                    className="w-4 h-4"
                  />
                  <span>Google</span>
                </button>
                <button
                  type="button"
                  onClick={() => pushToast("Apple Login integration ready", "info")}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-800 transition shadow-2xs"
                >
                  <img
                    src="https://www.svgrepo.com/show/511330/apple-173.svg"
                    alt="Apple"
                    className="w-4 h-4"
                  />
                  <span>Apple</span>
                </button>
              </div>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={closeLoginModal}
                  className="text-xs text-slate-500 hover:text-[#067a46] font-bold transition"
                >
                  Skip and continue browsing
                </button>
              </div>
            </form>
          )}

          {/* ── STEP 2: OTP Verification ── */}
          {loginStep === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              {/* Dev Mode Helper */}
              {devOtp && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center">
                  <p className="text-[10px] text-amber-700 font-extrabold uppercase tracking-wider mb-0.5">
                    DEV MODE — Verification OTP
                  </p>
                  <p className="text-2xl font-mono font-black text-amber-900 tracking-[0.3em]">
                    {devOtp}
                  </p>
                </div>
              )}

              {/* Header Details & Change Number */}
              <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl p-3">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Sending OTP to
                  </p>
                  <p className="text-sm font-extrabold text-slate-900">
                    +91 {pendingMobile}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setLoginStep("mobile")}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#067a46] hover:underline"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Change</span>
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 ml-1 mb-2 block text-center">
                  Enter 6-Digit OTP
                </label>
                <OtpInput
                  value={otpValue}
                  onChange={setOtpValue}
                  disabled={isSubmitting}
                />
                {otpError && (
                  <p className="text-xs font-semibold text-rose-600 mt-2 text-center">
                    {otpError}
                  </p>
                )}
              </div>

              {/* Timer & Resend OTP */}
              <div className="flex items-center justify-between text-xs font-bold">
                <span className={cn(timer.seconds > 0 ? "text-slate-500" : "text-rose-600")}>
                  {timer.seconds > 0 ? `Resend OTP in ${timer.formatted}` : "OTP Expired"}
                </span>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isSubmitting || timer.seconds > 0}
                  className="flex items-center gap-1.5 text-[#067a46] hover:text-[#046338] disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Resend OTP</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || otpValue.replace(/\D/g, "").length !== 6}
                className="w-full flex items-center justify-center gap-2 bg-[#067a46] hover:bg-[#046338] disabled:opacity-50 text-white font-extrabold py-3.5 rounded-xl transition shadow-sm active:scale-[0.99]"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying...</span>
                  </span>
                ) : (
                  <>
                    <span>Verify OTP</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ── STEP 3: Registration Profile ── */}
          {loginStep === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-[#067a46] text-white flex items-center justify-center shrink-0 font-bold text-xs">
                  ✓
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    Verified Number
                  </p>
                  <p className="text-sm font-extrabold text-[#067a46]">
                    +91 {pendingMobile}
                  </p>
                </div>
              </div>

              {regError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold">
                  {regError}
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-800 ml-1 mb-1.5 block">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3.5 border-2 border-slate-200 focus:border-[#067a46] focus:ring-2 focus:ring-[#067a46]/10 rounded-xl outline-none text-sm font-medium transition"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 ml-1 mb-1.5 block">
                  Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3.5 border-2 border-slate-200 focus:border-[#067a46] focus:ring-2 focus:ring-[#067a46]/10 rounded-xl outline-none text-sm font-medium transition"
                  disabled={isSubmitting}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !fullName.trim()}
                className="w-full flex items-center justify-center gap-2 bg-[#067a46] hover:bg-[#046338] disabled:opacity-50 text-white font-extrabold py-3.5 rounded-xl transition shadow-sm active:scale-[0.99]"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating Account...</span>
                  </span>
                ) : (
                  <>
                    <span>Complete Login</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}


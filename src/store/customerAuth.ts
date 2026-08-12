"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PendingAction = {
  type: "wishlist" | "checkout" | "custom";
  payload?: any;
} | null;

// Login flow step (drives multi-step modal UI)
export type LoginStep = "mobile" | "otp" | "register" | "done";

export type CustomerUser = {
  id: string;
  name: string;
  email: string | null;
  mobile: string;
  points: number;
  walletBalance: number;
};

type CustomerAuthState = {
  isAuthenticated: boolean;
  user: CustomerUser | null;
  isLoginModalOpen: boolean;
  redirectAfterLogin: string | null;
  pendingAction: PendingAction;

  // Multi-step login state
  loginStep: LoginStep;
  pendingMobile: string | null; // Mobile carried through OTP → register flow

  // Actions
  login: (user: CustomerUser) => void;
  logout: () => void;
  openLoginModal: (redirectPath?: string | null, action?: PendingAction) => void;
  closeLoginModal: () => void;
  clearPendingAction: () => void;
  setLoginStep: (step: LoginStep) => void;
  setPendingMobile: (mobile: string | null) => void;
};

export const useCustomerAuth = create<CustomerAuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      isLoginModalOpen: false,
      redirectAfterLogin: null,
      pendingAction: null,
      loginStep: "mobile",
      pendingMobile: null,

      login: (user) =>
        set({
          isAuthenticated: true,
          user,
          loginStep: "done",
        }),

      logout: () => {
        // Also call the API to clear the HTTP-only cookie
        fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
        set({
          isAuthenticated: false,
          user: null,
          redirectAfterLogin: null,
          pendingAction: null,
          loginStep: "mobile",
          pendingMobile: null,
        });
      },

      openLoginModal: (redirectPath = null, action = null) =>
        set({
          isLoginModalOpen: true,
          redirectAfterLogin: redirectPath,
          pendingAction: action,
          loginStep: "mobile",
          pendingMobile: null,
        }),

      closeLoginModal: () =>
        set({
          isLoginModalOpen: false,
          redirectAfterLogin: null,
          pendingAction: null,
          loginStep: "mobile",
          pendingMobile: null,
        }),

      clearPendingAction: () =>
        set({
          pendingAction: null,
          redirectAfterLogin: null,
        }),

      setLoginStep: (step) => set({ loginStep: step }),
      setPendingMobile: (mobile) => set({ pendingMobile: mobile }),
    }),
    { name: "flashkart-customer-auth" }
  )
);

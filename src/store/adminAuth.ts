"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AdminRole =
  | "Super Admin"
  | "Admin"
  | "Inventory Manager"
  | "Marketing Manager"
  | "Delivery Manager"
  | "Customer Support"
  | "Read Only";

export type AdminPermission =
  | "products.view" | "products.create" | "products.edit" | "products.delete" | "products.bulk"
  | "inventory.view" | "inventory.edit" | "inventory.transfer"
  | "categories.view" | "categories.edit"
  | "brands.view" | "brands.edit"
  | "orders.view" | "orders.edit" | "orders.invoice" | "orders.assign" | "orders.bulk"
  | "customers.view" | "customers.edit" | "customers.wallet"
  | "coupons.view" | "coupons.edit"
  | "banners.view" | "banners.edit"
  | "cms.view" | "cms.edit"
  | "reviews.view" | "reviews.moderate" | "reviews.edit"
  | "delivery.view" | "delivery.edit"
  | "notifications.view" | "notifications.send" | "notifications.edit"
  | "reports.view" | "reports.export"
  | "settings.view" | "settings.edit"
  | "support.view" | "support.edit"
  | "logs.view"
  | "roles.view" | "roles.edit";

export const ALL_PERMISSIONS: AdminPermission[] = [
  "products.view", "products.create", "products.edit", "products.delete", "products.bulk",
  "inventory.view", "inventory.edit", "inventory.transfer",
  "categories.view", "categories.edit",
  "brands.view", "brands.edit",
  "orders.view", "orders.edit", "orders.invoice", "orders.assign", "orders.bulk",
  "customers.view", "customers.edit", "customers.wallet",
  "coupons.view", "coupons.edit",
  "banners.view", "banners.edit",
  "cms.view", "cms.edit",
  "reviews.view", "reviews.moderate", "reviews.edit",
  "delivery.view", "delivery.edit",
  "notifications.view", "notifications.send", "notifications.edit",
  "reports.view", "reports.export",
  "settings.view", "settings.edit",
  "support.view", "support.edit",
  "logs.view",
  "roles.view", "roles.edit",
];

export const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  "Super Admin": [...ALL_PERMISSIONS],
  "Admin": ALL_PERMISSIONS.filter(p => !p.startsWith("roles.") && p !== "settings.edit"),
  "Inventory Manager": [
    "products.view", "products.create", "products.edit", "products.bulk",
    "inventory.view", "inventory.edit", "inventory.transfer",
    "categories.view", "brands.view", "orders.view", "logs.view"
  ],
  "Marketing Manager": [
    "products.view", "categories.view", "brands.view",
    "coupons.view", "coupons.edit",
    "banners.view", "banners.edit",
    "cms.view", "cms.edit",
    "reviews.view", "reviews.moderate",
    "notifications.view", "notifications.send",
    "reports.view", "logs.view"
  ],
  "Delivery Manager": [
    "orders.view", "orders.edit", "orders.invoice", "orders.assign",
    "delivery.view", "delivery.edit",
    "customers.view", "notifications.view", "notifications.send", "logs.view"
  ],
  "Customer Support": [
    "products.view", "categories.view", "brands.view",
    "orders.view", "orders.edit", "orders.invoice",
    "customers.view", "customers.edit", "customers.wallet",
    "reviews.view", "reviews.moderate",
    "notifications.view", "logs.view"
  ],
  "Read Only": ALL_PERMISSIONS.filter(p => p.endsWith(".view"))
};

// Simple hash simulation for client-side persistence and dev credentials verification
function simulateHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return "bcrypt_sha256_" + Math.abs(hash).toString(16) + "_flashkart_secure";
}

const DEFAULT_ADMIN_EMAIL = "admin@flashkart.co";
const ADMIN_MOBILE = "9773271029";
const DEFAULT_ADMIN_PASS_HASH = simulateHash("Admin@12345");

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  avatar: string;
  twoFactorEnabled?: boolean;
}

interface AdminAuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: AdminUser | null;
  rolePermissions: Record<AdminRole, AdminPermission[]>;
  twoFactorPending: boolean;
  pendingUser: AdminUser | null;
  loginAttempts: number;
  lockoutUntil: number | null;
  sessionExpiry: number | null;

  // Actions
  login: (email: string, pass: string, rememberMe?: boolean) => { success: boolean; message: string; require2FA?: boolean };
  verify2FA: (pin: string) => { success: boolean; message: string };
  logout: () => void;
  switchRole: (newRole: AdminRole) => void;
  hasPermission: (permission: AdminPermission) => boolean;
  updateRolePermissions: (role: AdminRole, permissions: AdminPermission[]) => void;
  toggle2FA: () => void;
  resetAttempts: () => void;
}

export const useAdminAuth = create<AdminAuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      token: null,
      user: null,
      rolePermissions: ROLE_PERMISSIONS,
      twoFactorPending: false,
      pendingUser: null,
      loginAttempts: 0,
      lockoutUntil: null,
      sessionExpiry: null,

      login: (email, pass, rememberMe = true) => {
        const now = Date.now();
        const state = get();

        // Rate limiting check
        if (state.lockoutUntil && now < state.lockoutUntil) {
          const remSec = Math.ceil((state.lockoutUntil - now) / 1000);
          return { success: false, message: `Account temporarily locked due to too many failed attempts. Try again in ${remSec}s.` };
        }

        const inputId = email.toLowerCase().trim().replace(/\s/g, "");
        const isAdminUser =
          inputId === DEFAULT_ADMIN_EMAIL ||
          inputId === ADMIN_MOBILE ||
          inputId === `+91${ADMIN_MOBILE}` ||
          inputId === "admin";
        const passHash = simulateHash(pass);

        // Verify against Super Admin account (accept Admin@12345 or any 6-digit OTP/password in dev)
        if (isAdminUser && (passHash === DEFAULT_ADMIN_PASS_HASH || pass === "123456" || /^\d{6}$/.test(pass))) {
          const userObj: AdminUser = {
            id: "admin_super_01",
            name: "Super Admin (You)",
            email: `+91 ${ADMIN_MOBILE}`,
            role: "Super Admin",
            avatar: "/images/avatars/farmer-1.jpg",
            twoFactorEnabled: false
          };

          if (userObj.twoFactorEnabled) {
            set({ twoFactorPending: true, pendingUser: userObj, loginAttempts: 0, lockoutUntil: null });
            return { success: true, message: "Please enter 2FA verification code.", require2FA: true };
          }

          // Generate simulated JWT token
          const token = "jwt_" + btoa(JSON.stringify({ sub: userObj.id, role: userObj.role, exp: now + 3600000 })) + "." + Math.random().toString(36).slice(2);
          const expiry = rememberMe ? now + 7 * 24 * 3600 * 1000 : now + 2 * 3600 * 1000;

          set({
            isAuthenticated: true,
            token,
            user: userObj,
            twoFactorPending: false,
            pendingUser: null,
            loginAttempts: 0,
            lockoutUntil: null,
            sessionExpiry: expiry
          });

          return { success: true, message: "Welcome back, Super Admin!" };
        }

        // Failed attempt
        const newAttempts = state.loginAttempts + 1;
        const newLockout = newAttempts >= 5 ? now + 60 * 1000 : null; // lock for 1 minute after 5 attempts
        set({ loginAttempts: newAttempts, lockoutUntil: newLockout });

        return {
          success: false,
          message: newAttempts >= 5
            ? "Too many failed attempts. Account locked for 60 seconds."
            : `Invalid email or password. Attempt ${newAttempts} of 5.`
        };
      },

      verify2FA: (pin) => {
        const state = get();
        if (!state.twoFactorPending || !state.pendingUser) {
          return { success: false, message: "No pending 2FA authentication session." };
        }

        // For demo, accept "123456" or any 6 digit PIN
        if (pin === "123456" || pin.length === 6) {
          const now = Date.now();
          const userObj = state.pendingUser;
          const token = "jwt_" + btoa(JSON.stringify({ sub: userObj.id, role: userObj.role, exp: now + 3600000 })) + "." + Math.random().toString(36).slice(2);
          const expiry = now + 7 * 24 * 3600 * 1000;

          set({
            isAuthenticated: true,
            token,
            user: userObj,
            twoFactorPending: false,
            pendingUser: null,
            loginAttempts: 0,
            sessionExpiry: expiry
          });
          return { success: true, message: "2FA Verification successful!" };
        }

        return { success: false, message: "Invalid 6-digit verification code. (Hint: enter 123456)" };
      },

      logout: () => {
        set({
          isAuthenticated: false,
          token: null,
          user: null,
          twoFactorPending: false,
          pendingUser: null
        });
      },

      switchRole: (newRole) => {
        const state = get();
        if (state.user) {
          set({
            user: { ...state.user, role: newRole }
          });
        }
      },

      hasPermission: (permission) => {
        const state = get();
        if (!state.isAuthenticated || !state.user) return false;
        if (state.user.role === "Super Admin") return true;
        const perms = state.rolePermissions[state.user.role] || [];
        return perms.includes(permission);
      },

      updateRolePermissions: (role, permissions) => {
        set((s) => ({
          rolePermissions: {
            ...s.rolePermissions,
            [role]: permissions
          }
        }));
      },

      toggle2FA: () => {
        set((s) => ({
          user: s.user ? { ...s.user, twoFactorEnabled: !s.user.twoFactorEnabled } : null
        }));
      },

      resetAttempts: () => set({ loginAttempts: 0, lockoutUntil: null })
    }),
    { name: "flashkart-admin-auth-v1" }
  )
);

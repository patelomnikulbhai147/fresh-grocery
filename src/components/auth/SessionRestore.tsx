"use client";
import { useEffect, useRef } from "react";
import { useCustomerAuth } from "@/store/customerAuth";

/**
 * Restores the customer login from the durable server session cookie when the
 * client (localStorage) copy is missing — e.g. after the browser dropped site
 * storage on close. Runs once on load: if not already authenticated, it asks
 * /api/auth/me and, if the 30-day session cookie is still valid, signs the
 * customer back in. Guests (no cookie) just get {authenticated:false}. Renders
 * nothing.
 */
export function SessionRestore() {
  const isAuthenticated = useCustomerAuth((s) => s.isAuthenticated);
  const login = useCustomerAuth((s) => s.login);
  const triedRef = useRef(false);

  useEffect(() => {
    if (isAuthenticated || triedRef.current) return;
    triedRef.current = true;
    let cancelled = false;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled && d?.authenticated && d.user) login(d.user);
      })
      .catch(() => {
        /* offline / no session — stay logged out */
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, login]);

  return null;
}

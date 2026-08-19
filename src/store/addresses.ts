"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SavedAddress = {
  id: string;
  /** Owner key — the logged-in user's mobile number. */
  userKey: string;
  label: string; // Home / Work / Other  (address type)
  name: string;
  phone: string;
  /** Detailed structured fields (§1, §23). */
  houseNumber?: string;
  buildingName?: string;
  floor?: string;
  street?: string;
  area?: string;
  landmark?: string;
  city: string;
  state?: string;
  pincode: string;
  /** Exact map location (§5) — present when picked/geocoded. */
  latitude?: number;
  longitude?: number;
  /** Legacy single-line address — kept for older saved addresses. */
  addressLine: string;
  isDefault: boolean;
};

/** Compose the structured fields into the stored single-line address. */
export function composeAddressLine(a: Partial<SavedAddress>): string {
  const parts = [
    [a.houseNumber, a.buildingName].filter(Boolean).join(", "),
    a.floor ? `${a.floor} Floor` : "",
    a.street,
    a.area,
    a.landmark ? `Near ${a.landmark}` : "",
  ].filter(Boolean);
  return parts.join(", ") || a.addressLine || "";
}

type AddressBookState = {
  addresses: SavedAddress[];
  /** Addresses belonging to one user only — User A never sees User B's data. */
  forUser: (userKey: string) => SavedAddress[];
  defaultFor: (userKey: string) => SavedAddress | undefined;
  add: (addr: Omit<SavedAddress, "id">) => SavedAddress;
  update: (id: string, patch: Partial<Omit<SavedAddress, "id" | "userKey">>) => void;
  remove: (id: string) => void;
  setDefault: (userKey: string, id: string) => void;
  /** Replace ALL of one user's addresses with the given list (server hydrate). */
  replaceUser: (userKey: string, list: SavedAddress[]) => void;
};

export const useAddressBook = create<AddressBookState>()(
  persist(
    (set, get) => ({
      addresses: [],
      forUser: (userKey) => get().addresses.filter((a) => a.userKey === userKey),
      defaultFor: (userKey) => {
        const mine = get().addresses.filter((a) => a.userKey === userKey);
        return mine.find((a) => a.isDefault) ?? mine[0];
      },
      add: (addr) => {
        const created: SavedAddress = { ...addr, id: `addr_${Math.random().toString(36).slice(2, 9)}` };
        set((s) => {
          const mine = s.addresses.filter((a) => a.userKey === addr.userKey);
          // First address for a user automatically becomes the default
          const makeDefault = created.isDefault || mine.length === 0;
          return {
            addresses: [
              ...s.addresses.map((a) =>
                a.userKey === addr.userKey && makeDefault ? { ...a, isDefault: false } : a
              ),
              { ...created, isDefault: makeDefault },
            ],
          };
        });
        return created;
      },
      update: (id, patch) =>
        set((s) => {
          const target = s.addresses.find((a) => a.id === id);
          if (!target) return s;
          return {
            addresses: s.addresses.map((a) => {
              if (a.id === id) return { ...a, ...patch };
              // Setting one address as default clears the flag on the user's others
              if (patch.isDefault && a.userKey === target.userKey) return { ...a, isDefault: false };
              return a;
            }),
          };
        }),
      remove: (id) =>
        set((s) => {
          const target = s.addresses.find((a) => a.id === id);
          const rest = s.addresses.filter((a) => a.id !== id);
          // If the default was deleted, promote the user's next address
          if (target?.isDefault) {
            const next = rest.find((a) => a.userKey === target.userKey);
            if (next) return { addresses: rest.map((a) => (a.id === next.id ? { ...a, isDefault: true } : a)) };
          }
          return { addresses: rest };
        }),
      setDefault: (userKey, id) =>
        set((s) => ({
          addresses: s.addresses.map((a) =>
            a.userKey === userKey ? { ...a, isDefault: a.id === id } : a
          ),
        })),
      replaceUser: (userKey, list) =>
        set((s) => ({
          // Drop this user's local rows, keep everyone else's, add the merged set.
          addresses: [
            ...s.addresses.filter((a) => a.userKey !== userKey),
            ...list.map((a) => ({ ...a, userKey })),
          ],
        })),
    }),
    { name: "flashkart-addresses-v1" }
  )
);

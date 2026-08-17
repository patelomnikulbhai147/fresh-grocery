import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phoneNumber, countryCode = "+91" } = body;

    // ── Validation ────────────────────────────────────────────────────────
    if (!phoneNumber || typeof phoneNumber !== "string") {
      return NextResponse.json(
        { success: false, error: "Phone number is required." },
        { status: 400 }
      );
    }
    const digits = phoneNumber.replace(/\D/g, "");
    if (digits.length < 7 || digits.length > 15) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid mobile number." },
        { status: 400 }
      );
    }

    let conn: Awaited<ReturnType<typeof pool.getConnection>> | null = null;
    try {
      conn = await pool.getConnection();
      // Table is created by initAuthTables (MySQL dialect) — no inline DDL needed.

      // Check for existing subscriber
      const [rows]: any = await conn.execute(
        `SELECT id, is_subscribed FROM whatsapp_subscribers WHERE phone_number = ? AND country_code = ?`,
        [digits, countryCode]
      );

      const existing = Array.isArray(rows) ? rows[0] : null;

      if (existing) {
        if (existing.is_subscribed) {
          return NextResponse.json(
            { success: false, error: "This number is already subscribed to deal alerts! 🎉" },
            { status: 409 }
          );
        }
        // Re-subscribe
        await conn.execute(
          `UPDATE whatsapp_subscribers SET is_subscribed = 1, updated_at = NOW() WHERE id = ?`,
          [existing.id]
        );
      } else {
        const { randomUUID } = await import("crypto");
        await conn.execute(
          `INSERT INTO whatsapp_subscribers (id, phone_number, country_code, source) VALUES (?, ?, ?, 'homepage_hot_deals')`,
          [randomUUID(), digits, countryCode]
        );
      }
    } catch (dbErr: any) {
      // Duplicate key on race condition
      if (dbErr?.code === "ER_DUP_ENTRY" || dbErr?.message?.includes("UNIQUE constraint failed")) {
        return NextResponse.json(
          { success: false, error: "This number is already subscribed! 🎉" },
          { status: 409 }
        );
      }
      console.warn("[WhatsApp Subscribe] DB error:", dbErr?.message);
    } finally {
      if (conn) conn.release();
    }

    return NextResponse.json({
      success: true,
      message: "You're subscribed! We'll send today's biggest discounts on WhatsApp before midnight.",
    });
  } catch (err: any) {
    console.error("[API /whatsapp/subscribe]:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}

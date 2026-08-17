import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/db";

/** GET /api/whatsapp/subscribers?page=1&search=&limit=20 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page   = Math.max(1, parseInt(searchParams.get("page")  || "1"));
    const limit  = Math.min(100, parseInt(searchParams.get("limit") || "20"));
    const search = (searchParams.get("search") || "").trim();
    const offset = (page - 1) * limit;

    let conn: Awaited<ReturnType<typeof pool.getConnection>> | null = null;
    try {
      conn = await pool.getConnection();
      // Table is created by initAuthTables (MySQL dialect) — no inline DDL needed.

      const where    = search ? `WHERE phone_number LIKE ?` : "";
      const dataParams: any[]  = search ? [`%${search}%`] : [];
      const cntParams: any[]   = search ? [`%${search}%`] : [];

      // limit/offset are sanitized integers — inlined because MySQL prepared
      // statements reject placeholders in LIMIT/OFFSET via mysql2 execute()
      const [rows]: any = await conn.execute(
        `SELECT id, phone_number, country_code, is_subscribed, source, created_at, updated_at, last_notif_sent
         FROM whatsapp_subscribers ${where} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`,
        dataParams
      );
      const [cntRows]: any = await conn.execute(
        `SELECT COUNT(*) AS total FROM whatsapp_subscribers ${where}`,
        cntParams
      );

      return NextResponse.json({
        success: true,
        subscribers: Array.isArray(rows) ? rows : [],
        total: Array.isArray(cntRows) && cntRows[0] ? cntRows[0].total : 0,
        page,
        limit,
      });
    } finally {
      if (conn) conn.release();
    }
  } catch (err: any) {
    console.error("[API /whatsapp/subscribers GET]:", err);
    return NextResponse.json(
      { success: true, subscribers: [], total: 0, page: 1, limit: 20 }
    );
  }
}

/** DELETE /api/whatsapp/subscribers  body: { id, action: 'unsubscribe'|'delete' } */
export async function DELETE(req: NextRequest) {
  try {
    const { id, action = "unsubscribe" } = await req.json();
    if (!id) {
      return NextResponse.json({ success: false, error: "ID required." }, { status: 400 });
    }

    let conn: Awaited<ReturnType<typeof pool.getConnection>> | null = null;
    try {
      conn = await pool.getConnection();
      if (action === "delete") {
        await conn.execute(`DELETE FROM whatsapp_subscribers WHERE id = ?`, [id]);
      } else {
        await conn.execute(
          `UPDATE whatsapp_subscribers SET is_subscribed = 0, updated_at = NOW() WHERE id = ?`,
          [id]
        );
      }
      return NextResponse.json({ success: true });
    } finally {
      if (conn) conn.release();
    }
  } catch (err: any) {
    console.error("[API /whatsapp/subscribers DELETE]:", err);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}

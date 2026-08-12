import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/db";

/**
 * POST /api/whatsapp/send-campaign
 *
 * Future-ready campaign sender hook.
 * Wire in your WhatsApp provider (Cloud API / Twilio / Interakt / AiSensy / WATI)
 * inside the switch block below — no database or frontend changes needed.
 *
 * Body:
 *  { provider?: string, message?: string, testPhone?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { provider = "cloud_api", message, testPhone } = body;

    const dealMessage = message || `🔥 *Today's Biggest Deals are Live!*

Don't miss today's fresh offers:

🥭 Mangoes – 35% OFF
🥕 Vegetables – 25% OFF
🥬 Leafy Greens – 20% OFF
🧅 Onions – 15% OFF

🛒 Shop Now: https://flashkart.co

⏰ Offer ends at midnight tonight!

_Reply STOP to unsubscribe._`;

    // Fetch active subscribers
    let subscribers: { phone_number: string; country_code: string }[] = [];
    let conn: Awaited<ReturnType<typeof pool.getConnection>> | null = null;
    try {
      conn = await pool.getConnection();
      const [rows]: any = await conn.execute(
        `SELECT phone_number, country_code FROM whatsapp_subscribers WHERE is_subscribed = 1`
      );
      subscribers = Array.isArray(rows) ? rows : [];
    } catch {
      // Table may not exist yet — silently continue
    } finally {
      if (conn) conn.release();
    }

    const targetCount = testPhone ? 1 : subscribers.length;

    // ── PROVIDER INTEGRATION HOOK ─────────────────────────────────────────
    // Uncomment and implement the provider you wish to use:
    //
    // switch (provider) {
    //   case "cloud_api":  await sendViaWhatsAppCloudAPI(subscribers, dealMessage);  break;
    //   case "twilio":     await sendViaTwilio(subscribers, dealMessage);            break;
    //   case "interakt":   await sendViaInterakt(subscribers, dealMessage);          break;
    //   case "aisensy":    await sendViaAiSensy(subscribers, dealMessage);           break;
    //   case "wati":       await sendViaWATI(subscribers, dealMessage);              break;
    // }
    //
    // After sending, update last_notif_sent:
    // await pool.execute(`UPDATE whatsapp_subscribers SET last_notif_sent = datetime('now') WHERE is_subscribed = 1`);

    console.log(`[WhatsApp Campaign] Provider: ${provider} | Recipients: ${targetCount} | Test: ${!!testPhone}`);

    return NextResponse.json({
      success: true,
      provider,
      isTest: !!testPhone,
      recipientCount: targetCount,
      preview: dealMessage,
      message: testPhone
        ? `Test message queued for ${testPhone}. Wire up your WhatsApp provider to send.`
        : `Campaign queued for ${targetCount} active subscriber(s). Wire up your WhatsApp provider to send.`,
    });
  } catch (err: any) {
    console.error("[API /whatsapp/send-campaign]:", err);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}

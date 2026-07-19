import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  return "127.0.0.1";
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request);

    // Logs tablosunu güncelle - ONAYLANIYOR durumuna çek
    await pool.query("UPDATE logs SET durum = ? WHERE ip = ?", [
      "ONAYLANIYOR",
      ip,
    ]);

    // Çevrimiçi tablosunu güncelle
    await pool.query("UPDATE cevrimici_tablosu SET sayfa = ? WHERE ip = ?", [
      "ONAYLANIYOR",
      ip,
    ]);

    return NextResponse.json({
      success: true,
      message: "Onay isteği alındı",
    });
  } catch (error: any) {
    console.error("Onay isteği hatası:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

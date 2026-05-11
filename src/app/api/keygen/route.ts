// src/app/api/keygen/route.ts
import { NextResponse } from "next/server";
import { generateKeyPair } from "@/lib/elgamal";

export async function POST() {
  try {
    // Ambil ukuran bit dari environment variables, fallback ke 160/1024 jika tidak ada
    const qBits = Number(process.env.KEY_SIZE_Q) || 160;
    const pBits = Number(process.env.KEY_SIZE_P) || 1024;

    // Catatan: Mencari bilangan prima 1024-bit secara murni menggunakan JavaScript
    // akan memakan waktu komputasi beberapa detik. Ini normal.
    const keyPair = await generateKeyPair(qBits, pBits);

    return NextResponse.json(
      {
        success: true,
        message: "Pasangan kunci berhasil dibuat",
        data: keyPair,
      },
      { status: 201 },
    ); // 201 Created
  } catch (error) {
    console.error("Error pada Key Generation:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal membuat pasangan kunci internal server",
        error: String(error),
      },
      { status: 500 },
    );
  }
}

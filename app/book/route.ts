import { NextResponse } from "next/server";

export function GET() {
  const target = process.env.CALCOM_BOOKING_URL;
  if (!target)
    return NextResponse.redirect(
      new URL(
        "/contact",
        process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
      ),
      307,
    );
  try {
    const url = new URL(target);
    if (url.protocol !== "https:" || url.search || url.hash)
      throw new Error("invalid booking target");
    return NextResponse.redirect(url, 307);
  } catch {
    return NextResponse.redirect(
      new URL(
        "/contact",
        process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
      ),
      307,
    );
  }
}

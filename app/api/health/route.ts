import { NextResponse } from "next/server";
import { getConfig } from "@/lib/config/env";
import { requestIdFrom, withRequestId } from "@/lib/security/request-id";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: Request): Response {
  const requestId = requestIdFrom(request);
  const config = getConfig();
  const response = NextResponse.json(
    {
      status: "ok",
      releaseId:
        process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.RELEASE_ID ?? "local",
    },
    { status: 200, headers: { "cache-control": "no-store" } },
  );
  response.headers.set("x-environment", config.environment);
  return withRequestId(response, requestId);
}

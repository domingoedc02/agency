import { NextResponse } from "next/server";
import { isAllowedOrigin } from "@/lib/security/origin";
import { MAX_BODY_BYTES, validateInquiry } from "@/lib/security/validation";
import { SubmissionError, submitInquiry } from "@/lib/use-cases/submit-inquiry";

export const dynamic = "force-dynamic";
function requestId() {
  return crypto.randomUUID();
}
function json(body: object, status: number, id: string, headers?: HeadersInit) {
  return NextResponse.json(
    { ...body, requestId: id },
    { status, headers: { "Cache-Control": "no-store", ...headers } },
  );
}
export async function POST(request: Request) {
  const id = requestId();
  if (
    !request.headers
      .get("content-type")
      ?.toLowerCase()
      .startsWith("application/json")
  )
    return json(
      { error: { code: "UNSUPPORTED_MEDIA_TYPE", message: "Send JSON." } },
      415,
      id,
    );
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_BODY_BYTES)
    return json(
      {
        error: {
          code: "PAYLOAD_TOO_LARGE",
          message: "Your request is too large.",
        },
      },
      413,
      id,
    );
  if (!isAllowedOrigin(request))
    return json(
      {
        error: {
          code: "ORIGIN_NOT_ALLOWED",
          message: "This request is not allowed.",
        },
      },
      403,
      id,
    );
  let payload: unknown;
  try {
    const body = await request.text();
    if (new TextEncoder().encode(body).byteLength > MAX_BODY_BYTES)
      return json(
        {
          error: {
            code: "PAYLOAD_TOO_LARGE",
            message: "Your request is too large.",
          },
        },
        413,
        id,
      );
    payload = JSON.parse(body);
  } catch {
    return json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Enter the requested details.",
        },
      },
      422,
      id,
    );
  }
  const result = validateInquiry(payload);
  if (!result.ok)
    return json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Check the highlighted fields.",
          fields: result.fields,
        },
      },
      422,
      id,
    );
  try {
    return json(await submitInquiry(result.value, id), 202, id);
  } catch (error) {
    if (error instanceof SubmissionError)
      return json(
        {
          error: {
            code: error.code,
            message:
              error.code === "RATE_LIMITED"
                ? "Try again later."
                : error.code === "DUPLICATE_REQUEST"
                  ? "This enquiry was already submitted."
                  : "We could not deliver your enquiry. Try again.",
          },
        },
        error.status,
        id,
        error.code === "RATE_LIMITED" ? { "Retry-After": "900" } : undefined,
      );
    return json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Something went wrong. Try again.",
        },
      },
      500,
      id,
    );
  }
}
export async function GET() {
  return NextResponse.json(
    {
      error: { code: "METHOD_NOT_ALLOWED", message: "Use POST." },
      requestId: requestId(),
    },
    { status: 405, headers: { Allow: "POST", "Cache-Control": "no-store" } },
  );
}

import type { InquiryInput } from "../domain/inquiry";
import type { ResendLeadPort } from "../domain/providers";

export interface ResendClient {
  emails: {
    send(request: Readonly<{ from: string; to: string; subject: string; text: string }>): Promise<{
      data?: { id?: string };
      error?: unknown;
    }>;
  };
}

export interface ResendAdapterOptions {
  readonly client: ResendClient;
  readonly from: string;
  readonly to: string;
  readonly timeoutMs?: number;
}

const SAFE_EMAIL = /^[^\r\n<>]+@[^\r\n<>]+\.[^\r\n<>]+$/;

function assertServerAddress(value: string): string {
  if (!SAFE_EMAIL.test(value) || value.includes("\r") || value.includes("\n")) {
    throw new Error("Invalid email configuration");
  }
  return value;
}

function escapePlainText(value: string): string {
  return [...value]
    .map((character) => {
      const code = character.codePointAt(0) ?? 0;
      return code <= 0x1f || code === 0x7f || code === 0x2028 || code === 0x2029 ? " " : character;
    })
    .join("");
}

function formatInquiry(input: InquiryInput, requestId: string): string {
  return [
    `Request ID: ${escapePlainText(requestId)}`,
    `Name: ${escapePlainText(input.name)}`,
    `Email: ${escapePlainText(input.email)}`,
    `Company: ${escapePlainText(input.company)}`,
    `Goals: ${escapePlainText(input.goals)}`,
    `Budget range: ${input.budgetRange}`,
    `Timeline: ${input.timeline}`,
  ].join("\n");
}

export class ResendAdapter implements ResendLeadPort {
  readonly provider = "resend" as const;
  private readonly options: ResendAdapterOptions;

  constructor(options: ResendAdapterOptions) {
    this.options = options;
  }

  async sendInquiry(input: InquiryInput, requestId: string) {
    let from: string;
    let to: string;
    try {
      from = assertServerAddress(this.options.from);
      to = assertServerAddress(this.options.to);
    } catch {
      return { ok: false as const, reason: "invalid-config" as const };
    }

    const timeoutMs = this.options.timeoutMs ?? 4_000;
    const delivery = this.options.client.emails.send({
      from,
      to,
      subject: "New TrustMotion consultation inquiry",
      text: formatInquiry(input, requestId),
    });
    const timeout = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("provider timeout")), timeoutMs);
    });

    try {
      const result = await Promise.race([delivery, timeout]);
      if (result.error || !result.data?.id) return { ok: false as const, reason: "unavailable" as const };
      return {
        ok: true as const,
        receipt: { status: "accepted" as const, requestId, providerMessageId: result.data.id },
      };
    } catch {
      return { ok: false as const, reason: "timeout" as const };
    }
  }
}

export { escapePlainText, formatInquiry };

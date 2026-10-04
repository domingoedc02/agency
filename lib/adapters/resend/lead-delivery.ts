import type { InquiryInput } from "@/lib/domain/inquiry";

export type DeliveryPort = (input: InquiryInput) => Promise<{ providerMessageId: string }>;

export const deliverInquiry: DeliveryPort = async (input) => {
  // Synthetic provider boundary for local/staging. Production wiring belongs here and keeps recipient fixed.
  void input;
  if (process.env.SYNTHETIC_RESEND_FAILURE === "true") throw new Error("delivery unavailable");
  return { providerMessageId: `synthetic-${crypto.randomUUID()}` };
};

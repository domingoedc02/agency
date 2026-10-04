import { SiteHeader } from "@/components/content/SiteHeader";
import { SiteFooter } from "@/components/content/SiteFooter";
import { InquiryForm } from "@/components/interactive/InquiryForm";
export const metadata = {
  title: "Contact | TrustMotion Agency",
  description: "Tell TrustMotion what you are trying to make easier.",
};
export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section aria-labelledby="contact-title">
          <p className="eyebrow">Start a conversation</p>
          <h1 id="contact-title">
            Tell us what you are trying to make easier.
          </h1>
          <p className="lede">
            A few useful details help us understand whether we can help. We only
            use this information to respond to your enquiry.
          </p>
          <InquiryForm />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

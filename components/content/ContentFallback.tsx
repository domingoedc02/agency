import Link from "next/link";
export function ContentFallback() { return <section aria-labelledby="fallback-title"><h1 id="fallback-title">A clearer next step starts with a conversation.</h1><p>Our editorial content is being refreshed. You can still tell us what you are working toward.</p><Link className="button" href="/contact">Send an enquiry</Link></section>; }

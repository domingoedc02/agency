import Link from "next/link";
export function SiteHeader() { return <header className="site-header"><Link href="/" className="brand">TrustMotion</Link><nav aria-label="Primary"><Link href="/work">Work</Link><Link href="/contact">Contact</Link><Link href="/book">Book a conversation</Link></nav></header>; }

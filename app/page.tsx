import Link from "next/link";

export default function HomePage() {
  return (
    <main className="site-shell">
      <header className="site-header">
        <Link className="brand" href="/" aria-label="TrustMotion Agency home">
          TrustMotion<span>Agency</span>
        </Link>
        <a className="text-link" href="#contact">
          Start a conversation <span aria-hidden="true">↗</span>
        </a>
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <p className="eyebrow">Strategy · Design · Digital</p>
        <h1 id="hero-title">
          Make the next move <em>matter.</em>
        </h1>
        <p className="hero-copy">
          We help ambitious teams turn meaningful ideas into clear, useful
          digital experiences that move their business forward.
        </p>
        <a className="button" href="#contact">
          Tell us what you&apos;re building <span aria-hidden="true">↗</span>
        </a>
      </section>

      <section className="principles" aria-labelledby="principles-title">
        <p className="eyebrow" id="principles-title">
          How we work
        </p>
        <div className="principle-grid">
          <article>
            <span className="number">01</span>
            <h2>Find the signal.</h2>
            <p>
              We get close to the problem, ask better questions, and make the
              complexity useful.
            </p>
          </article>
          <article>
            <span className="number">02</span>
            <h2>Make it matter.</h2>
            <p>
              We shape ideas into focused stories, systems, and products people
              want to use.
            </p>
          </article>
          <article>
            <span className="number">03</span>
            <h2>Keep moving.</h2>
            <p>
              We build momentum with practical work, honest partnership, and
              room to adapt.
            </p>
          </article>
        </div>
      </section>

      <footer className="site-footer" id="contact">
        <p>Have a good problem?</p>
        <a href="mailto:hello@trustmotion.agency">hello@trustmotion.agency</a>
        <span>© {new Date().getFullYear()} TrustMotion Agency</span>
      </footer>
    </main>
  );
}

import Link from "next/link";
import { ctaHref, type LandingContent } from "@/lib/domain/content";

export function LandingSections({ content }: { content: LandingContent }) {
  return <>
    <section className="hero" aria-labelledby="hero-title"><p className="eyebrow">{content.hero.eyebrow}</p><h1 id="hero-title">{content.hero.title}</h1><p className="lede">{content.hero.summary}</p><div className="actions">{content.ctas.map((cta) => <Link className="button" href={ctaHref(cta)} key={cta.label}>{cta.label}</Link>)}</div></section>
    <section aria-labelledby="intro-title"><p className="eyebrow">A useful starting point</p><h2 id="intro-title">{content.intro}</h2></section>
    <section aria-labelledby="services-title"><p className="eyebrow">What we do</p><h2 id="services-title">Strategy, experience, and delivery that work together.</h2><div className="grid">{content.services.map((service) => <article className="card" key={service.slug}><h3>{service.title}</h3><p>{service.summary}</p><ul>{service.outcomes.map((outcome) => <li key={outcome}>{outcome}</li>)}</ul></article>)}</div></section>
    <section aria-labelledby="process-title"><p className="eyebrow">How we work</p><h2 id="process-title">A focused process with room for evidence.</h2><ol className="process">{content.process.length ? content.process.map((step) => <li key={step.title}>{step.title}{step.description ? ` — ${step.description}` : ""}</li>) : <li>Understand the decision, shape the path, and improve with evidence.</li>}</ol></section>
    <section aria-labelledby="proof-title"><p className="eyebrow">Proof, responsibly presented</p><h2 id="proof-title">{content.proof}</h2>{content.featuredCaseStudies.length > 0 && <div className="grid">{content.featuredCaseStudies.map((study) => <Link className="card" href={`/work/${study.slug}`} key={study.slug}><h3>{study.clientContext}</h3><p>{study.challenge}</p></Link>)}</div>}</section>
  </>;
}

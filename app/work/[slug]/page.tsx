import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/content/SiteHeader";
import { SiteFooter } from "@/components/content/SiteFooter";
import { fallbackLanding, isEligibleCaseStudy } from "@/lib/domain/content";
export function generateStaticParams() {
  return fallbackLanding.featuredCaseStudies
    .filter((study) => isEligibleCaseStudy(study))
    .map((study) => ({ slug: study.slug }));
}
export default async function WorkDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const study = fallbackLanding.featuredCaseStudies.find(
    (candidate) => candidate.slug === slug && isEligibleCaseStudy(candidate),
  );
  if (!study) notFound();
  return (
    <>
      <SiteHeader />
      <main>
        <article className="prose">
          <p className="eyebrow">Verified case study</p>
          <h1>{study.clientContext}</h1>
          <h2>Challenge</h2>
          <p>{study.challenge}</p>
          <h2>Approach</h2>
          <p>{study.approach}</p>
          <h2>Outcomes</h2>
          <ul>
            {study.outcomes.map((outcome) => (
              <li key={outcome}>{outcome}</li>
            ))}
          </ul>
          <p className="source">Source: {study.sourceReference}</p>
          <Link href="/contact" className="button">
            Discuss a similar challenge
          </Link>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}

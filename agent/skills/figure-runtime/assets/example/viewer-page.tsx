// Template: a viewer page for one figure, for a Next.js App Router site whose figures are registered
// in components/explainers/registry.ts under "<post>/<figure>". Put it at app/explainers/[post]/[figure]/page.tsx
// and adapt the import path and the selector that hides the site chrome.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { explainers } from "@/components/explainers/registry";

// One explainer figure alone, for agents and people building it: no nav, no post, nothing else to
// shift it around. Add ?figure-t=<seconds|end> to freeze it at any moment instead of playing.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export function generateStaticParams() {
  return Object.keys(explainers).map((key) => {
    const [post, figure] = key.split("/");
    return { post, figure };
  });
}

export default async function ExplainerViewer({ params }: { params: Promise<{ post: string; figure: string }> }) {
  const { post, figure } = await params;
  const Figure = explainers[`${post}/${figure}`];
  if (!Figure) notFound();

  return (
    <main className="px-4 py-6">
      <style>{"body > nav, body > footer { display: none }"}</style>
      <div id="figure" className="mx-auto w-full max-w-[52rem]">
        <Figure />
      </div>
    </main>
  );
}

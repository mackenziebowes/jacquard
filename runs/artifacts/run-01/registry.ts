import type { ComponentType } from "react";
import OpeningDiff from "./prose-scrub-0-4-a-small-model-as-second-reader/OpeningDiff";

/**
 * Explainer figures (SVG/canvas) placed in posts by an `explainer` content block.
 * One component per file in this directory, keyed by `<post-slug>/<figure-name>`.
 */
export const explainers: Record<string, ComponentType> = {
  "prose-scrub-0-4-a-small-model-as-second-reader/opening-diff": OpeningDiff,
};

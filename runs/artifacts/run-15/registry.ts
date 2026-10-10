import type { ComponentType } from "react";
import EeatShippedWeight from "./eeat-requires-custom-websites/ShippedWeight";
import GenerativeOgHalftoneRibbon from "./generative-og-images-built-and-measured/HalftoneRibbon";
import GenerativeOgPageToMap from "./generative-og-images-built-and-measured/PageToMap";
import GenerativeOgNoTextOnTheCard from "./generative-og-images-built-and-measured/NoTextOnTheCard";
import GenerativeOgSealedMiddle from "./generative-og-images-built-and-measured/SealedMiddle";
import GenerativeOgLeadingLamp from "./generative-og-images-built-and-measured/LeadingLamp";
import GenerativeOgOneSeedTwoSynths from "./generative-og-images-built-and-measured/OneSeedTwoSynths";
import VibeManufacturingDraftSieve from "./how-and-why-to-get-involved-with-vibe-manufacturing/DraftSieve";
import VibeManufacturingCheckLoop from "./how-and-why-to-get-involved-with-vibe-manufacturing/CheckLoop";
import VibeManufacturingWhereToStand from "./how-and-why-to-get-involved-with-vibe-manufacturing/WhereToStand";
import VibeManufacturingFirstOrderLog from "./how-and-why-to-get-involved-with-vibe-manufacturing/FirstOrderLog";
import VibeManufacturingCapitalRoad from "./how-and-why-to-get-involved-with-vibe-manufacturing/CapitalRoad";
import VibeManufacturingCountStopsHere from "./how-and-why-to-get-involved-with-vibe-manufacturing/CountStopsHere";
import ProseScrubHeightCheck from "./prose-scrub-built-by-the-agent-it-gates/HeightCheck";
import WhereOwnersLeavingTheFeed from "./where-small-business-owners-hang-out-online/LeavingTheFeed";
import ProseScrub04TwoReaders from "./prose-scrub-0-4-a-small-model-as-second-reader/TwoReaders";
import ProseScrub04HeadingBet from "./prose-scrub-0-4-a-small-model-as-second-reader/HeadingBet";
import ProseScrub04TwoQuestions from "./prose-scrub-0-4-a-small-model-as-second-reader/TwoQuestions";
import ProseScrub04FiveRuns from "./prose-scrub-0-4-a-small-model-as-second-reader/FiveRuns";
import ProseScrub04ClaimField from "./prose-scrub-0-4-a-small-model-as-second-reader/ClaimField";
import ProseScrubOpeningDiff from "./prose-scrub-0-4-a-small-model-as-second-reader/OpeningDiff";
import EeatHeroTrustStreet from "./what-is-google-eeat/HeroTrustStreet";
import EeatTrustFooting from "./what-is-google-eeat/TrustFooting";
import EeatMedicSlide from "./what-is-google-eeat/MedicSlide";
import EeatYmylBar from "./what-is-google-eeat/YmylBar";
import EeatExperienceAdded from "./what-is-google-eeat/ExperienceAdded";
import EeatRealPhoto from "./what-is-google-eeat/RealPhoto";
import EeatPlumbLine from "./what-is-google-eeat/PlumbLine";
import EeatCitedStall from "./what-is-google-eeat/CitedStall";
import EeatHonestDoor from "./what-is-google-eeat/HonestDoor";
import EeatRaterLoop from "./what-is-google-eeat/RaterLoop";
import EeatOneWayStairs from "./what-is-google-eeat/OneWayStairs";
import EeatUnseenStall from "./what-is-google-eeat/UnseenStall";
import EeatTwoBars from "./what-is-google-eeat/TwoBars";

/**
 * Explainer figures (SVG/canvas) placed in posts by an `explainer` content block.
 * One component per file in this directory, keyed by `<post-slug>/<figure-name>`.
 */
export const explainers: Record<string, ComponentType> = {
  "eeat-requires-custom-websites/shipped-weight": EeatShippedWeight,
  "generative-og-images-built-and-measured/halftone-ribbon": GenerativeOgHalftoneRibbon,
  "generative-og-images-built-and-measured/page-to-map": GenerativeOgPageToMap,
  "generative-og-images-built-and-measured/no-text-on-the-card": GenerativeOgNoTextOnTheCard,
  "generative-og-images-built-and-measured/sealed-middle": GenerativeOgSealedMiddle,
  "generative-og-images-built-and-measured/leading-lamp": GenerativeOgLeadingLamp,
  "generative-og-images-built-and-measured/one-seed-two-synths": GenerativeOgOneSeedTwoSynths,
  "how-and-why-to-get-involved-with-vibe-manufacturing/draft-sieve": VibeManufacturingDraftSieve,
  "how-and-why-to-get-involved-with-vibe-manufacturing/check-loop": VibeManufacturingCheckLoop,
  "how-and-why-to-get-involved-with-vibe-manufacturing/where-to-stand": VibeManufacturingWhereToStand,
  "how-and-why-to-get-involved-with-vibe-manufacturing/first-order-log": VibeManufacturingFirstOrderLog,
  "how-and-why-to-get-involved-with-vibe-manufacturing/capital-road": VibeManufacturingCapitalRoad,
  "how-and-why-to-get-involved-with-vibe-manufacturing/count-stops-here": VibeManufacturingCountStopsHere,
  "prose-scrub-built-by-the-agent-it-gates/height-check": ProseScrubHeightCheck,
  "prose-scrub-0-4-a-small-model-as-second-reader/two-readers": ProseScrub04TwoReaders,
  "prose-scrub-0-4-a-small-model-as-second-reader/heading-bet": ProseScrub04HeadingBet,
  "prose-scrub-0-4-a-small-model-as-second-reader/two-questions": ProseScrub04TwoQuestions,
  "prose-scrub-0-4-a-small-model-as-second-reader/five-runs": ProseScrub04FiveRuns,
  "prose-scrub-0-4-a-small-model-as-second-reader/claim-field": ProseScrub04ClaimField,
  "prose-scrub-0-4-a-small-model-as-second-reader/opening-diff": ProseScrubOpeningDiff,
  "where-small-business-owners-hang-out-online/leaving-the-feed": WhereOwnersLeavingTheFeed,
  "what-is-google-eeat/hero-trust-street": EeatHeroTrustStreet,
  "what-is-google-eeat/trust-footing": EeatTrustFooting,
  "what-is-google-eeat/medic-slide": EeatMedicSlide,
  "what-is-google-eeat/ymyl-bar": EeatYmylBar,
  "what-is-google-eeat/experience-added": EeatExperienceAdded,
  "what-is-google-eeat/real-photo": EeatRealPhoto,
  "what-is-google-eeat/plumb-line": EeatPlumbLine,
  "what-is-google-eeat/cited-stall": EeatCitedStall,
  "what-is-google-eeat/honest-door": EeatHonestDoor,
  "what-is-google-eeat/rater-loop": EeatRaterLoop,
  "what-is-google-eeat/one-way-stairs": EeatOneWayStairs,
  "what-is-google-eeat/unseen-stall": EeatUnseenStall,
  "what-is-google-eeat/two-bars": EeatTwoBars,
};

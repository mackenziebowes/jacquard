import { hydrateRoot } from "react-dom/client";
import LeakyJar from "../../agent/skills/figure-runtime/assets/example/LeakyJar";

hydrateRoot(document.getElementById("root")!, <LeakyJar />);

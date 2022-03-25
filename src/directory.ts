import debounce from "lodash/debounce";
import { assert } from "ts-essentials";
import { categoriesMasks } from "./categories-masks";
import { hideList } from "./hide-list";

const handledClass = "clean-asmr-twitch-handled";

const settings = {
  rerun: true,
  categories: {
    "not-a-live": true,
    "pegi-18": true,
    "stolen-content": true,
  },
};

export function directory() {
  const currentCategoriesMask = Object.entries(settings.categories).reduce<number>(function (
    mask,
    [key, active],
  ) {
    if (!active) {
      return mask;
    }

    const categoryMask = categoriesMasks[key] ?? 0x0;

    return mask | categoryMask;
  },
  0x0);

  const main = document.querySelector<HTMLElement>("main");

  assert(main, "main not found");

  main.classList.add("cta-directory-container");

  const mainWatchUnload = mainWatch(main, function () {
    for (const tile of Array.from(
      main.querySelectorAll<HTMLElement>(`[data-target][style^="order:"]`),
    )) {
      // Hide Rerun ?
      if (settings.rerun && isRerun(tile)) {
        tileVisibility(tile, false);
        continue;
      }

      // Hide by categories ?
      if (currentCategoriesMask > 0x0 && isInAnActiveCategory(tile, currentCategoriesMask)) {
        tileVisibility(tile, false);
        continue;
      }

      // Nothing ? then show it
      tileVisibility(tile, true);
    }
  });

  return () => {
    mainWatchUnload();
    main.classList.remove("cta-directory-container");
  };
}

function mainWatch(main: HTMLElement, cb: () => void) {
  const debouncedCb = debounce(cb, 300);

  const obs = new MutationObserver(() => debouncedCb());

  obs.observe(main, {
    childList: true,
    subtree: true,
  });

  return () => obs.disconnect();
}

function tileVisibility(tile: HTMLElement, show: boolean): void {
  tile.classList.toggle("cta-directory-show", show);
}

function isRerun(tile: HTMLElement): boolean {
  const icons = tile.querySelectorAll(".stream-type-indicator--rerun");

  if (icons.length > 1) {
    console.warn("tile > isRerun more than 1 svg detected");
  }

  return icons.length === 1;
}

function isInAnActiveCategory(tile: HTMLElement, categoriesMask: number): boolean {
  const [, name] =
    tile
      .querySelector("[data-a-id]")
      ?.getAttribute("data-a-id")
      ?.match(/^card-(.*)$/) ?? [];

  if (!name) {
    return false;
  }

  const streamMask = hideList[name];

  if (!streamMask) {
    return false;
  }

  return (categoriesMask & streamMask) !== 0x0;
}

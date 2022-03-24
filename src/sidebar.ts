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

export function sidebar() {
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

  const sidebar = document.querySelector<HTMLElement>(".side-bar-contents");

  assert(sidebar, "sidebar not found");

  sidebar.classList.add("cta-sidebar-container");

  const sidebarWatchUnload = sidebarWatch(sidebar, function () {
    for (const sideTile of Array.from(sidebar.querySelectorAll<HTMLElement>(`a[href^="/"]`))) {
      // Offline channel ?
      if (isOffline(sideTile)) {
        sideTileVisibility(sideTile, true);
        continue;
      }

      // Hide Rerun ?
      if (settings.rerun && isRerun(sideTile)) {
        sideTileVisibility(sideTile, false);
        continue;
      }

      // Hide by categories ?
      if (currentCategoriesMask > 0x0 && isInAnActiveCategory(sideTile, currentCategoriesMask)) {
        sideTileVisibility(sideTile, false);
        continue;
      }

      // Nothing ? then show it
      sideTileVisibility(sideTile, true);
    }
  });

  return () => {
    sidebarWatchUnload();
    sidebar.classList.remove("cta-sidebar-container");
  };
}

function sidebarWatch(sidebar: HTMLElement, cb: () => void) {
  const debouncedCb = debounce(cb, 300);

  const obs = new MutationObserver(() => debouncedCb());

  obs.observe(sidebar, {
    childList: true,
    subtree: true,
  });

  return () => obs.disconnect();
}

function sideTileVisibility(sideTile: HTMLElement, show: boolean): void {
  if (!sideTile) {
    return;
  }

  sideTile.classList.toggle("cta-sidebar-show", show);
}

function isRerun(sideTile: HTMLElement): boolean {
  const icons = sideTile.querySelectorAll("svg");

  if (icons.length > 1) {
    console.warn("sideTile >isRerun more than 1 svg detected");
  }

  return icons.length === 1;
}

function isOffline(sideTile: HTMLElement): boolean {
  const offlineTags = sideTile.querySelectorAll(".side-nav-card__avatar--offline");
  return offlineTags.length > 0;
}

function isInAnActiveCategory(sideTile: HTMLElement, categoriesMask: number): boolean {
  const [, name] = sideTile.getAttribute("href")?.match(/^\/(.*)$/) ?? [];

  if (!name) {
    return false;
  }

  const streamMask = hideList[name];

  if (!streamMask) {
    return false;
  }

  return (categoriesMask & streamMask) !== 0x0;
}

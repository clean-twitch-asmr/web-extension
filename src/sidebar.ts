import debounce from "lodash/debounce";
import { categoriesMasks } from "./categories-masks";
import { hideList } from "./hide-list";

const handledClass = "clean-asmr-twitch-handled";

const settings = {
  rerun: true,
  categories: {
    "pegi-18": true,
    "fake-rerun": true,
    "stolen-content": true,
    "24-7-manga": true,
    "24-7-nature": true,
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

  const sidebar = getSidebar(".side-bar-contents");

  const sidebarWatchUnload = sidebarWatch(sidebar, function () {
    for (const sideTile of sideTilesFromSidebar(sidebar)) {
      // Offline channel ?
      if (isOffline(sideTile)) {
        markAsHandled(sideTile);
        continue;
      }

      // Hide Rerun ?
      if (settings.rerun && isRerun(sideTile)) {
        sideTileVisibility(sideTile, false);
        markAsHandled(sideTile);
        continue;
      }

      // Hide by categories ?
      if (currentCategoriesMask > 0x0 && isInAnActiveCategory(sideTile, currentCategoriesMask)) {
        sideTileVisibility(sideTile, false);
        markAsHandled(sideTile);
        continue;
      }

      // Nothing ? then show it
      sideTileVisibility(sideTile, true);
    }
  });

  return () => {
    // Unsubscrive from watch
    sidebarWatchUnload();
    // Remove handled class
    for (const handledElement of Array.from(
      sidebar.querySelectorAll<HTMLElement>(`.${handledClass}`),
    )) {
      handledElement.classList.remove(handledClass);
    }
  };
}

function getSidebar(selector: string): HTMLElement {
  const containers = document.querySelectorAll<HTMLElement>(selector);

  if (containers.length !== 1) {
    console.warn(`we found many sidebar with selector [${selector}] we expected only one`);
  }

  return containers.item(0);
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

function sideTilesFromSidebar(sidebar: HTMLElement): HTMLElement[] {
  return Array.from(sidebar.querySelectorAll<HTMLElement>(`a[href^="/"]:not(.${handledClass})`));
}

function sideTileVisibility(sideTile: HTMLElement, show: boolean): void {
  const parent = findSideTileParent(sideTile);

  if (!parent) {
    return;
  }

  parent.style.display = show ? "inherit" : "none";
}

function findSideTileParent(element: HTMLElement): HTMLElement | undefined {
  return element.parentElement?.parentElement?.parentElement ?? undefined;
}

function markAsHandled(sideTile: HTMLElement) {
  sideTile.classList.add(handledClass);
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

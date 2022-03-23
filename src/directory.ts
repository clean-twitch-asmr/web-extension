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

  const main = getMain();

  const mainWatchUnload = mainWatch(main, function () {
    for (const tile of tilesFromMain(main)) {
      // Hide Rerun ?
      if (settings.rerun && isRerun(tile)) {
        tileVisibility(tile, false);
        markAsHandled(tile);
        continue;
      }

      // Hide by categories ?
      if (currentCategoriesMask > 0x0 && isInAnActiveCategory(tile, currentCategoriesMask)) {
        tileVisibility(tile, false);
        markAsHandled(tile);
        continue;
      }

      // Nothing ? then show it
      tileVisibility(tile, true);
    }
  });

  return () => {
    mainWatchUnload();
    // Remove handled class
    for (const handledElement of Array.from(
      main.querySelectorAll<HTMLElement>(`.${handledClass}`),
    )) {
      handledElement.classList.remove(handledClass);
    }
  };
}

function getMain(): HTMLElement {
  const selector = "main";
  const mains = document.querySelectorAll<HTMLElement>(selector);

  if (mains.length !== 1) {
    console.warn(`we found many main tags with selector [${selector}] we expected only one`);
  }

  return mains.item(0);
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

function tilesFromMain(main: HTMLElement): HTMLElement[] {
  return Array.from(
    main.querySelectorAll<HTMLElement>(
      `[data-target="directory-container"] article[data-a-id^="card-"]:not(.${handledClass})`,
    ),
  );
}

function tileVisibility(tile: HTMLElement, show: boolean): void {
  const parent = findTileParent(tile);

  if (!parent) {
    return;
  }

  if (!show) {
    parent.style.display = "none";
  }
}

function findTileParent(element: HTMLElement): HTMLElement | undefined {
  return element.parentElement?.parentElement?.parentElement?.parentElement ?? undefined;
}

function markAsHandled(tile: HTMLElement) {
  tile.classList.add(handledClass);
}

function isRerun(tile: HTMLElement): boolean {
  const icons = tile.querySelectorAll(".stream-type-indicator--rerun");

  if (icons.length > 1) {
    console.warn("tile > isRerun more than 1 svg detected");
  }

  return icons.length === 1;
}

function isInAnActiveCategory(tile: HTMLElement, categoriesMask: number): boolean {
  const [, name] = tile.getAttribute("data-a-id")?.match(/^card-(.*)$/) ?? [];

  if (!name) {
    return false;
  }

  const streamMask = hideList[name];

  if (!streamMask) {
    return false;
  }

  return (categoriesMask & streamMask) !== 0x0;
}

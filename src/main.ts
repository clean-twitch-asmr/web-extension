import { directory } from "./directory";

export function main() {
  const locationWatchUnload = locationWatch(function (path) {
    // Directory
    if (path.toLowerCase().startsWith("/directory/game/asmr")) {
      const directoryUnload = directory();

      return () => directoryUnload();
    }

    // Page Unknown -> do nothing
    return () => {};
  });

  return () => {
    locationWatchUnload();
  };
}

function locationWatch(currentPage: (path: string) => () => void) {
  let currentPath: string | undefined = undefined;
  let currentPageUnload: () => void | undefined;

  const intervalId = window.setInterval(function () {
    const newPath = window.location.pathname;

    if (newPath === currentPath) {
      return;
    }

    currentPath = newPath;
    currentPageUnload?.();

    currentPageUnload = currentPage(currentPath);
  }, 300);

  return () => {
    window.clearInterval(intervalId);
    currentPageUnload?.();
  };
}

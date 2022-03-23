import { main } from "./main";
import { sidebar } from "./sidebar";

function init() {
  const sidebarUnload = sidebar();
  const mainUnload = main();

  return () => {
    sidebarUnload();
    mainUnload();
  };
}

window.addEventListener("DOMContentLoaded", () => window.addEventListener("unload", init()));

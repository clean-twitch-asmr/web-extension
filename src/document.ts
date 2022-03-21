import { sidebar } from "./sidebar";

function init() {
  const sidebarUnload = sidebar();
  return () => sidebarUnload();
}

window.addEventListener("DOMContentLoaded", () => window.addEventListener("unload", init()));

import { env } from "@nolanrigo/env";
import { readFile, writeFile } from "fs/promises";
import { resolve } from "path";

const CHROME_DIST = env("CHROME_DIST");

(async function () {
  const { version, author } = JSON.parse(
    await readFile(resolve(__dirname, "../package.json"), { encoding: "utf8" }),
  );
  const manifest = JSON.parse(
    await readFile(resolve(__dirname, "../src/manifest.chrome.json"), { encoding: "utf8" }),
  );

  await writeFile(
    resolve(__dirname, "..", CHROME_DIST, "manifest.json"),
    JSON.stringify({ ...manifest, version, author }, null, 2),
    {
      encoding: "utf8",
    },
  );
})();

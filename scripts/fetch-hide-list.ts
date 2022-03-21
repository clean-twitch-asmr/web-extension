import { resolve } from "path";
import { assert } from "ts-essentials";
import { categoriesMasks } from "../src/categories-masks";
import { file } from "./helpers/file";
import { issues } from "./helpers/issues";

(async function () {
  const hideList: Record<string, number> = {};

  for await (const { title, labels } of issues("clean-twitch-asmr", "hide-list")) {
    const artist = title.toLowerCase();

    let mask = 0x0;

    for (const label of labels) {
      assert(label instanceof Object, "we looking for object version of label");
      assert(label.name, "label.name should be defined");

      mask |= categoriesMasks[label.name] ?? 0x0;
    }

    hideList[artist] = mask;
  }

  await file(
    resolve(__dirname, "../src/hide-list.ts"),
    `
      export const hideList: Record<string, number> = ${JSON.stringify(hideList)};
    `,
    { parser: "typescript" },
  );
})();

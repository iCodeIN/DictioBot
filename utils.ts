import {
  Element,
  Node,
} from "https://deno.land/x/deno_dom@v0.1.15-alpha/deno-dom-wasm.ts";
import { Results } from "./types.ts";

// A workaround for some weird problem. Why should `querySelectorAll` not exist on `Node`?
export const qsa = (node: Node, selectors: string) =>
  (node as Element).querySelectorAll(selectors);

// Seem to be providing a lot of safety to the users. Like don’t even guess what they inputted, just hash it.
export const encodeInput = async (input: string) =>
  Array.from(
    new Uint8Array(
      await crypto.subtle.digest("SHA-1", new TextEncoder().encode(input)),
    ),
  )
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

export const resultsToText = (results: Results) =>
  results
    .map(
      (result) =>
        result.translated +
        (result.sources ? ": " + result.sources.join(" - ") : ""),
    )
    // .sort((a, b) => a.length - b.length) // Doing this too would make it much cooler for viewing, but looks like the results are originally sorted by their meanings’ closeness to the input, and we should respect that.
    .join("\n");

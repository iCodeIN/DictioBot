import {
  DOMParser,
} from "https://deno.land/x/deno_dom@v0.1.15-alpha/deno-dom-wasm.ts";
import { encodeInput, qsa } from "./utils.ts";
import { Results } from "./types.ts";

const cachedResults = new Map<string, Results>();

export async function translate(input: string) {
  input = input.toLowerCase();
  const inputEncoded = await encodeInput(input);

  const cachedResult = cachedResults.get(inputEncoded);

  if (cachedResult) return cachedResult;

  const response = await fetch(
    "https://dictio.kurditgroup.org/dictio/" + encodeURIComponent(input),
  );
  const html = await response.text();
  const document = new DOMParser().parseFromString(html, "text/html");

  if (document == null) throw new Error("An unexpected error occurred");

  const results: Results = [];

  // Credits go to @dolanskurd for his work in https://github.com/dolanskurd/dictio
  for (const container of qsa(document, "div.col-md-8.offset-md-2")) {
    for (const ul of qsa(container, "ul")) {
      for (const li of qsa(ul, "li.list-group-item")) {
        for (
          const { textContent: translated } of qsa(
            li,
            "span.dictio-result-item",
          )
        ) {
          results.push({ translated });
        }

        for (
          const { textContent: source } of qsa(
            li,
            "span.text-secondary.bg-light.pl-2.pr-2",
          )
        ) {
          const i = results[results.length == 0 ? 0 : results.length - 1];

          if (typeof i !== "undefined") {
            i.sources ? i.sources.push(source) : (i.sources = [source]);
          }
        }
      }
    }
  }

  if (results.length != 0) cachedResults.set(inputEncoded, results);

  return results;
}

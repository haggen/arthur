import { parseHTML } from "linkedom";

/**
 * Populate the reference list with all links found in the page.
 *
 * @param {string} src
 */
export function buildLinkRefList(src) {
  const { document } = parseHTML(src);
  const list = document.querySelector("#linkreflist");

  if (!list) {
    return src;
  }

  list.innerHTML = "";

  for (const anchor of document.querySelectorAll("a[href]")) {
    if (anchor.closest(".print\\:hidden, .not-print\\:hidden")) {
      continue;
    }

    const li = document.createElement("li");
    li.textContent = anchor.getAttribute("href");
    list.appendChild(li);

    const citation = document.createElement("sup");
    citation.textContent = `[${list.children.length}]`;
    citation.classList.add("not-print:hidden");
    anchor.insertAdjacentElement("afterend", citation);
  }

  return document.toString();
}

/**
 * Vite plugin to collect links references using inline citations.
 *
 * @return {import('vite').Plugin}
 */
export function plugin() {
  return {
    name: "linkreflist",

    enforce: "post",

    transformIndexHtml(html, ctx) {
      if (!ctx.server) {
        return html;
      }

      return buildLinkRefList(html);
    },

    generateBundle(_, bundle) {
      for (const file of Object.values(bundle)) {
        if (file.type === "asset" && file.fileName.endsWith(".html")) {
          file.source = buildLinkRefList(file.source.toString());
        }
      }
    },
  };
}

import { parseHTML } from "linkedom";
import {
  getTranslation,
  defaultLanguage,
  availableLanguages,
} from "./translations.js";

const translatableElementAttr = "translate";

/**
 * Get the translatable text from an element.
 *
 * @param {HTMLElement} element
 */
export function getElementTranslatableText(element) {
  const prop = element.getAttribute(translatableElementAttr);
  if (prop === "" || prop === "innerHTML") {
    return element.innerHTML;
  }
  const text = element.getAttribute(prop);
  if (text === null) {
    throw new Error(`Element's missing the attribute "${prop}" to translate`);
  }
  return text;
}

/**
 * Change the translatable text of an element.
 *
 * @param {HTMLElement} element
 * @param {string} text
 */
function setElementTranslatableText(element, text) {
  const prop = element.getAttribute(translatableElementAttr);

  if (prop === "" || prop === "innerHTML") {
    element.innerHTML = text;
  } else {
    element.setAttribute(prop, text);
  }
}

/**
 * Query all translatable elements in the provided document.
 *
 * @param {Document} doc
 */
export function queryAllTranslatableElements(doc) {
  return doc.querySelectorAll(`[${translatableElementAttr}]`);
}

/**
 * Translate the source HTML.
 *
 * @param {string} src
 * @param {string} lang
 */
function translateHtml(src, lang) {
  if (!availableLanguages().includes(lang)) {
    throw new Error(`Unsupported language: ${lang}`);
  }

  const { document } = parseHTML(src);

  queryAllTranslatableElements(document).forEach((element) => {
    const originalText = getElementTranslatableText(element);
    const translatedText = getTranslation(originalText, lang);

    setElementTranslatableText(element, translatedText ?? originalText);

    element.removeAttribute(translatableElementAttr);
  });

  document.documentElement.setAttribute("lang", lang);

  return document.toString();
}

const redirectToDefaultLang = `<!doctype html><meta http-equiv="refresh" content="0; url=/${defaultLanguage()}/" />`;

/**
 * Vite plugin for translating HTML at build time.
 *
 * @return {import('vite').Plugin}
 */
export function plugin() {
  return {
    name: "translate",

    enforce: "post",

    transformIndexHtml(html, ctx) {
      if (!ctx.server) {
        return html;
      }

      const url = new URL(ctx.originalUrl ?? "/", "http://localhost");
      const lang = url.pathname.split("/")[1];

      if (lang === "") {
        return redirectToDefaultLang;
      }

      return translateHtml(
        html,
        availableLanguages().includes(lang) ? lang : defaultLanguage(),
      );
    },

    generateBundle(_, bundle) {
      const index = bundle["index.html"];

      if (index?.type !== "asset") {
        return;
      }

      const html = index.source.toString();

      for (const lang of availableLanguages()) {
        if (lang === "default") {
          continue;
        }

        this.emitFile({
          type: "asset",
          fileName: `${lang}/index.html`,
          source: translateHtml(html, lang),
        });
      }

      index.source = redirectToDefaultLang;
    },
  };
}

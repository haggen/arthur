import data from "./translations.json" with { type: "json" };

/**
 * Normalize text to be used as translation key.
 *
 * @param {string} text
 */
export function normalizeText(text) {
  return text.trim().replace(/\s+/g, " ");
}

/**
 * List available languages.
 */
export function availableLanguages() {
  return Object.keys(data).filter((lang) => lang !== "default");
}

/**
 * Get default language.
 */
export function defaultLanguage() {
  return data.default;
}

/**
 * Check if there's a translation for a given text and language.
 *
 * @param {string} text
 * @param {string} lang
 */
export function hasTranslation(text, lang) {
  if (data[lang] === undefined) {
    throw new Error(`Unsupported language: ${lang}`);
  }
  return data[lang][normalizeText(text)] !== undefined;
}

/**
 * Get the translation for a given text and language.
 *
 * @param {string} text
 * @param {string} lang
 */
export function getTranslation(text, lang) {
  if (data[lang] === undefined) {
    throw new Error(`Unsupported language: ${lang}`);
  }

  return data[lang][normalizeText(text)];
}

/**
 * Set the translation for a given text and language.
 *
 * @param {string} text
 * @param {string} lang
 * @param {string} translation
 */
export function setTranslation(text, lang, translation) {
  if (data[lang] === undefined) {
    throw new Error(`Unsupported language: ${lang}`);
  }

  data[lang][normalizeText(text)] = translation;
}

/**
 * Delete a translation.
 *
 * @param {string} text
 * @param {string} lang
 */
export function deleteTranslation(text, lang) {
  if (data[lang] === undefined) {
    throw new Error(`Unsupported language: ${lang}`);
  }

  delete data[lang][normalizeText(text)];
}

/**
 * Get all translations texts.
 *
 * @param {string} lang
 */
export function translations(lang) {
  if (lang) {
    return data[lang];
  }
  return data;
}

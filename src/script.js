import ga from "ga-lite";
import twemoji from "twemoji";

ga("create", "UA-25158047-1", "auto");
ga("send", "pageview");

// -
// -
// -

const docEl = document.documentElement;
docEl.defaultLang = docEl.lang;

Object.defineProperty(docEl, "supportedLangs", {
  get() {
    const value = this.getAttribute("supported-langs") || "";
    return value.split(/[,\b]+/).map(lang => lang.trim());
  }
});

const detachedElements = [];

function getElementLocation(element) {
  const loc = {
    element,
    parent: element.parentElement,
    index: -1
  };

  let sibling = element;
  do {
    sibling = sibling.previousElementSibling;
    loc.index += 1;
  } while (sibling);

  return loc;
}

function reattachElement(loc) {
  if (!loc.parent.parentElement) {
    throw Error(
      "reattachElement: Parent element is no longer present in the DOM tree"
    );
  }
  loc.parent.insertBefore(loc.element, loc.parent.children[loc.index]);
}

function detachElement(element) {
  const loc = getElementLocation(element);
  loc.parent.removeChild(element);
  return loc;
}

function resolveLanguage(targetedLang) {
  if (typeof targetedLang !== "string" || targetedLang.length === 0) {
    throw Error("Bad argument");
  }
  let selectedLang;
  for (const lang of docEl.supportedLangs) {
    if (lang === targetedLang) {
      return lang;
    }
    if (
      !selectedLang &&
      targetedLang.substring(0, 2) === lang.substring(0, 2)
    ) {
      selectedLang = lang;
    }
  }
  return selectedLang || docEl.defaultLang;
}

function changeLanguage(lang) {
  const selectedLang = resolveLanguage(lang);
  console.log("Changing language to:", selectedLang);
  while (detachedElements.length > 0) {
    reattachElement(detachedElements.pop());
  }
  document.documentElement.lang = selectedLang;
  const elements = document.querySelectorAll(`[lang]`);
  [].forEach.call(elements, element => {
    if (element.getAttribute("lang") != selectedLang) {
      detachedElements.push(detachElement(element));
    }
  });
}

// -
// -
// -

function getPreferredColorScheme() {
  const prefers = value =>
    window.matchMedia(`(prefers-color-scheme: ${value})`).matches;

  if (prefers("dark")) {
    return "dark";
  } else if (prefers("light")) {
    return "light";
  }
  return null;
}

function toggleColorScheme() {
  const selectedValue = docEl.getAttribute("color-scheme");
  if (selectedValue === "dark") {
    docEl.setAttribute("color-scheme", "light");
  } else {
    docEl.setAttribute("color-scheme", "dark");
  }
}

document.addEventListener("DOMContentLoaded", e => {
  const preferredValue = getPreferredColorScheme();
  docEl.setAttribute("color-scheme", preferredValue);

  const toggle = document.querySelector("[data-toggle-color-scheme]");
  toggle.addEventListener("click", e => toggleColorScheme());
});

// -
// -
// -

function handleLocation(path) {
  if (path === "/") {
    changeLanguage(document.documentElement.defaultLang);
  } else {
    changeLanguage(path.split("/").pop());
  }
}

document.addEventListener("DOMContentLoaded", e => {
  handleLocation(location.pathname);

  [].forEach.call(document.querySelectorAll(".emoji"), emoji =>
    twemoji.parse(emoji)
  );
});

window.addEventListener("popstate", e => {
  handleLocation(location.pathname);
});

document.addEventListener("click", e => {
  if (e.target.closest("a[local]")) {
    e.preventDefault();
    history.pushState(null, null, e.target.href);
    handleLocation(location.pathname);
  }
});

// -
// -
// -

const isLocal =
  /(^|\.)localhost$/.test(location.hostname) ||
  "127.0.0.1" == location.hostname ||
  "::1" === location.hostname;

if (!isLocal && "serviceWorker" in navigator) {
  window.addEventListener("load", function() {
    const serviceWorker = "/service-worker.js";
    navigator.serviceWorker.register(serviceWorker).then(
      registration => {
        console.log(
          "ServiceWorker registration successful with scope: ",
          registration.scope
        );
      },
      err => {
        console.error("ServiceWorker registration failed: ", err);
      }
    );
  });
}

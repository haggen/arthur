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
  const docEl = document.documentElement;
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

const detachedElements = [];

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

const docEl = document.documentElement;
docEl.defaultLang = docEl.lang;

Object.defineProperty(docEl, "supportedLangs", {
  get() {
    const value = this.getAttribute("supported-langs") || "";
    return value.split(/[,\b]+/).map(lang => lang.trim());
  }
});

// -
// -
// -

function handle(path) {
  if (path === "/") {
    changeLanguage(document.documentElement.defaultLang);
  } else {
    changeLanguage(path.split("/").pop());
  }
}

document.addEventListener("DOMContentLoaded", e => {
  handle(location.pathname);
});

window.addEventListener("popstate", e => {
  handle(location.pathname);
});

window.addEventListener("click", e => {
  if (e.target.matches("a[local")) {
    e.preventDefault();
    history.pushState(null, null, e.target.href);
    handle(location.pathname);
  }
});

// -
// -
// -

if ("serviceWorker" in navigator) {
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

function getElementLocation(element) {
  const location = {
    element,
    parent: element.parentElement,
    index: -1
  };

  let sibling = element;
  do {
    sibling = sibling.previousElementSibling;
    location.index += 1;
  } while (sibling);

  return location;
}

function reattachElement(loc) {
  if (!loc.parent.parentElement) {
    throw Error(
      "reattachElement: Parent element is no longer present in the DOM tree"
    );
  }
  loc.parent.insertBefore(loc.element, loc.parent.children[location.index]);
}

function detachElement(element) {
  const loc = getElementLocation(element);
  loc.parent.removeChild(element);
  return loc;
}

function resolveLanguage(lang) {
  const docEl = document.documentElement;
  if (docEl.availableLangs.indexOf(lang) > -1) {
    return lang;
  }
  const prefix = lang.split("-")[0];
  if (docEl.availableLangs.indexOf(prefix) > -1) {
    return prefix;
  }
  console.log("Unsupported language:", lang);
  return docEl.defaultLang;
}

const detachedElements = [];

function changeLanguage(lang) {
  const selectedLang = resolveLanguage(lang);
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
docEl.availableLangs = docEl.getAttribute("available-langs");

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

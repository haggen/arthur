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

function reattachElement(location) {
  if (!location.parent.parentElement) {
    throw Error(
      "reattachElement: Parent element is no longer present in the DOM tree"
    );
  }
  location.parent.insertBefore(
    location.element,
    location.parent.children[location.index]
  );
}

function detachElement(element) {
  const location = getElementLocation(element);
  location.parent.removeChild(element);
  return location;
}

const detachedElements = [];

function changeLanguage(lang) {
  while (detachedElements.length > 0) {
    reattachElement(detachedElements.pop());
  }
  document.documentElement.setAttribute("lang", lang);
  const elements = document.querySelectorAll(`[lang]`);
  [].forEach.call(elements, element => {
    if (element.getAttribute("lang") != lang) {
      detachedElements.push(detachElement(element));
    }
  });
}
window.changeLanguage = changeLanguage;

document.addEventListener("DOMContentLoaded", e => {
  let selectedLang = document.documentElement.lang;

  if (navigator.language) {
    let sample = document.querySelector(`[lang="${navigator.language}"]`);
    if (!sample) {
      const prefix = navigator.language.split("-")[0];
      sample = document.querySelector(`[lang|="${prefix}"]`);
    }
    if (sample) {
      selectedLang = sample.lang;
      console.log("Language derived from navigator.language:", sample.lang);
    }
  }

  if (selectedLang) {
    changeLanguage(selectedLang);
  } else {
    throw Error("Attribute [lang] is missing from the documentElement");
  }
});

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

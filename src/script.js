import ga from "ga-lite";

ga("create", "UA-25158047-1", "auto");
ga("send", "pageview");

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
    throw Error("reattachElement: Parent element is no longer present in the DOM tree");
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
    if (!selectedLang && targetedLang.substring(0, 2) === lang.substring(0, 2)) {
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

function random(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

class Typewriter {
  constructor(el, texts) {
    this.writeDelay = 30;
    this.eraseDelay = 10;
    this.cycleDelay = 3000;
    this.state = "cycling";
    this.texts = texts || [];
    this.index = 0;
    this.el = el;
    this.lastUpdate = 0;

    this.update(0);
  }

  update(timestamp) {
    switch (this.state) {
      case "writing":
        this.write(timestamp);
        break;
      case "erasing":
        this.erase(timestamp);
        break;
      case "cycling":
        this.cycle(timestamp);
        break;
    }
    requestAnimationFrame(timestamp => this.update(timestamp));
  }

  write(timestamp) {
    if (timestamp - this.lastUpdate < this.writeDelay) {
      return;
    }
    const currentText = this.texts[this.index];
    if (this.el.textContent === currentText) {
      this.state = "cycling";
      return;
    }
    this.el.textContent = currentText.substring(0, this.el.textContent.length + 1);
    this.lastUpdate = timestamp;
    this.writeDelay = random(10, 100);
  }

  cycle(timestamp) {
    if (timestamp - this.lastUpdate < this.cycleDelay) {
      return;
    }
    this.index += 1;
    if (this.index < 0 || this.index >= this.texts.length) {
      this.index = 0;
    }
    this.state = "erasing";
    this.lastUpdate = timestamp;
  }

  erase(timestamp) {
    if (timestamp - this.lastUpdate < this.eraseDelay) {
      return;
    }
    if (this.el.textContent.length === 0) {
      this.state = "writing";
      return;
    }
    this.el.textContent = this.el.textContent.substring(0, this.el.textContent.length - 1);
    this.lastUpdate = timestamp;
  }
}

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
  [].forEach.call(document.querySelectorAll(".typewriter"), element => {
    const typewriter = new Typewriter(element, element.getAttribute("data-variation").split("|"));
  });

  handle(location.pathname);
});

window.addEventListener("popstate", e => {
  handle(location.pathname);
});

document.addEventListener("click", e => {
  if (e.target.closest("a[local]")) {
    e.preventDefault();
    history.pushState(null, null, e.target.href);
    handle(location.pathname);
  }
});

// -
// -
// -

const isLocal = /(^|\.)localhost$/.test(location.hostname) || "127.0.0.1" == location.hostname || "::1" === location.hostname;

if (!isLocal && "serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    const serviceWorker = "/service-worker.js";
    navigator.serviceWorker.register(serviceWorker).then(
      registration => {
        console.log("ServiceWorker registration successful with scope: ", registration.scope);
      },
      err => {
        console.error("ServiceWorker registration failed: ", err);
      }
    );
  });
}

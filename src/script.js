function getElementLocation(target) {
  const location = {
    target,
    parent: target.parentElement,
    index: -1
  };

  let sibling = target;
  do {
    sibling = sibling.previousElementSibling;
    location.index += 1;
  } while (sibling);

  return location;
}

function reattachElement(location) {
  location.parent.insertBefore(
    location.target,
    location.parent.children[location.index]
  );
}

function detachElement(target) {
  const location = getElementLocation(target);
  location.parent.removeChild(target);
  return location;
}

const savedLocations = [];

function changeLanguage(lang) {
  while (savedLocations.length > 0) {
    reattachElement(savedLocations.pop());
  }
  document.firstElementChild.setAttribute("lang", lang);
  const elements = document.querySelectorAll(`[lang]`);
  [].forEach.call(elements, element => {
    if (element.getAttribute("lang") != lang) {
      savedLocations.push(detachElement(element));
    }
  });
}
window.changeLanguage = changeLanguage;

document.addEventListener("DOMContentLoaded", e => {
  switch (navigator.language) {
    case "pt":
    case "pt-BR":
      changeLanguage("pt-BR");
      break;
    default:
      changeLanguage("en");
  }
});

function getElementLocation(target) {
  const location = {
    target,
    parent: target.parentElement,
    index: -1
    // depth: -1
  };

  let sibling = target;
  do {
    sibling = sibling.previousElementSibling;
    location.index += 1;
  } while (sibling);

  //   let parent = target;
  //   do {
  //     parent = parent.parentElement;
  //     location.depth += 1;
  //   } while (parent);

  return location;
}

// function compareLocationDepth(a, b) {
//   return a.depth < b.depth ? -1 : a.depth === b.depth ? 0 : 1;
// }

function reattachElements(locations) {
  //   locations.sort(compareLocationDepth);

  for (let i = locations.length; i > 0; i--) {
    const loc = locations.pop();
    loc.parent.insertBefore(loc.target, loc.parent.children[loc.index]);
  }
}

function detachElement(target) {
  const loc = getElementLocation(target);
  loc.parent.removeChild(target);
  return loc;
}

const removedLocations = [];

function changeLanguage(lang) {
  if (removedLocations.length > 0) {
    reattachElements(removedLocations);
  }
  document.firstElementChild.setAttribute("lang", lang);
  const elements = document.querySelectorAll(`[lang]`);
  [].forEach.call(elements, element => {
    if (element.getAttribute("lang") != lang) {
      removedLocations.push(detachElement(element));
    }
  });
}

document.addEventListener("DOMContentLoaded", e => {
  changeLanguage(document.firstElementChild.getAttribute("lang"));
});

window.changeLanguage = changeLanguage;

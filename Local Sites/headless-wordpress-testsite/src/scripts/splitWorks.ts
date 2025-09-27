// split
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

interface SplitElement {
  containers: HTMLDivElement | null;
  left: HTMLDivElement | null;
  right: HTMLDivElement | null;
  rightHeader: HTMLElement | null;
  rightText: HTMLElement | null;
  spImage: HTMLImageElement | null;
  rightLink: HTMLAnchorElement | null;
  iconMenuItems: NodeListOf<HTMLLIElement> | null;
}

// left ⇔ right アニメーション
document.addEventListener("DOMContentLoaded", function () {
  const containers = document.querySelectorAll(".split__container");

  containers.forEach((container) => {
    const splitElement: SplitElement = {
      containers: container as HTMLDivElement,
      left: container.querySelector(".left") as HTMLDivElement,
      right: container.querySelector(".right") as HTMLDivElement,
      rightHeader: container.querySelector(".right__header") as HTMLElement,
      rightText: container.querySelector(".right__text") as HTMLElement,
      spImage: container.querySelector(".right__spImage") as HTMLImageElement,
      rightLink: container.querySelector("right__link") as HTMLAnchorElement,
      iconMenuItems: container.querySelectorAll(".right__iconMenu_item"),
    };

    if (splitElement.left) {
      splitElement.left.addEventListener("mouseenter", () => {
        container.classList.add("hover-left");
        setTimeout(() => fadeInElement(splitElement.left?.querySelector(".left__inner")), 1100);
      });

      splitElement.left.addEventListener("mouseleave", () => {
        container.classList.remove("hover-left");
        fadeOutElement(splitElement.left?.querySelector(".left__inner"));
      });
    }

    if (splitElement.right) {
      splitElement.right.addEventListener("mouseenter", () => {
        container.classList.add("hover-right");

        if (splitElement.spImage) setTimeout(() => fadeInElement(splitElement.spImage), 800);
        if (splitElement.rightHeader) addStyledText(splitElement.rightHeader, 200);
        if (splitElement.rightLink) {
          setTimeout(() => fadeInElement(splitElement.rightLink), 800);
          addStyledText(splitElement.rightLink, 100);
        }
        if (splitElement.rightText) {
          setTimeout(() => fadeInElement(splitElement.rightText), 800);
          addStyledText(splitElement.rightText, 100);
        }
        // if (splitElement.rightLink) addStyledText(splitElement.rightLink, 100);
        // if (splitElement.rightLink) addStyledText(splitElement.rightLink, 100);
      });

      splitElement.right.addEventListener("mouseleave", () => {
        container.classList.remove("hover-right");

        if (splitElement.spImage) fadeOutElement(splitElement.spImage);
        if (splitElement.rightText) fadeOutElement(splitElement.rightText);
      });
    }

    //icon
    if (splitElement.iconMenuItems) {
      splitElement.iconMenuItems.forEach((icon) => {
        icon.addEventListener("mouseenter", () => {
          icon.classList.add("is-active");
        });
        icon.addEventListener("mouseleave", () => {
          icon.classList.remove("is-active");
        });
      });
    }
  });
});

// 左サイド モーダルウィンドウ in
function fadeInElement(element: Element | null | undefined): void {
  if (element) {
    gsap.to(element, {
      opacity: 1,
      duration: 1.2,
      ease: "power1.out",
    });
  }
}

function fadeOutElement(element: Element | null | undefined): void {
  if (element) {
    gsap.to(element, {
      opacity: 0,
      duration: 1,
      ease: "power1.out",
    });
  }
}

// テキストアニメーション
function addStyledText(element: HTMLElement, delay: number): void {
  const newText = [...(element.textContent ?? "")].map((char) => `<span>${char}</span>`);
  element.innerHTML = newText.join("");

  Array.from(element.children).forEach((char, index) => {
    setTimeout(() => char.classList.add("is-active"), delay * index);
  });
}

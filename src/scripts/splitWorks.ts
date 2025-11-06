// split
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// GSAPプラグインを登録
gsap.registerPlugin(ScrollTrigger);

// left ⇔ right アニメーション
// DOMが既に読み込まれている場合とこれから読み込まれる場合の両方に対応
// ブラウザ環境でのみ実行（SSR時のエラーを防ぐ）
if (typeof window !== "undefined" && typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      initSplitAnimations();
    });
  } else {
    // DOMが既に読み込まれている場合は即座に実行
    initSplitAnimations();
  }
}

function initSplitAnimations() {
  const containers = document.querySelectorAll(".split__container");
  const isMobile = window.innerWidth <= 768;

  containers.forEach((container) => {
    const splitElement = {
      containers: container,
      left: container.querySelector(".left"),
      right: container.querySelector(".right"),
      rightHeader: container.querySelector(".right__header"),
      rightText: container.querySelector(".right__text"),
      spImage: container.querySelector(".right__spImage"),
      rightLink: container.querySelector(".right__link"),
      iconMenuItems: container.querySelectorAll(".right__iconMenu_item"),
    };

    // スマホサイズの場合、パララックス効果とスクロールアニメーション
    if (isMobile) {
      if (splitElement.spImage) {
        gsap.set(splitElement.spImage, { opacity: 1 });
      }
      if (splitElement.rightText) {
        gsap.set(splitElement.rightText, { opacity: 1 });
      }
      if (splitElement.rightLink) {
        gsap.set(splitElement.rightLink, { opacity: 1 });
        const linkText = splitElement.rightLink.textContent;
        if (linkText !== null && linkText !== "") {
          addStyledText(splitElement.rightLink, 100);
        }
      }
      const headerText = splitElement.rightHeader?.textContent;
      if (splitElement.rightHeader && headerText !== null && headerText !== "") {
        addStyledText(splitElement.rightHeader, 200);
      }

      if (splitElement.left) {
        gsap.set(splitElement.left, { opacity: 1, y: 0 });

        const leftInner = splitElement.left.querySelector(".left__inner");
        if (leftInner) {
          gsap.set(leftInner, { opacity: 1, y: 0 });
        }

        ScrollTrigger.create({
          trigger: splitElement.left,
          start: "top bottom",
          end: "top center",
          scrub: 1,
          onUpdate: (self) => {
            const progress = self.progress;
            if (leftInner) {
              gsap.to(leftInner, {
                opacity: progress,
                y: 30 * (1 - progress),
                duration: 0.1,
              });
            }
          },
        });

        const leftImage = splitElement.left.querySelector(".left__image");
        if (leftImage) {
          ScrollTrigger.create({
            trigger: splitElement.left,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
            onUpdate: (self) => {
              gsap.to(leftImage, {
                y: -20 * self.progress,
                duration: 0.1,
              });
            },
          });
        }
      }
    } else {
      // デスクトップサイズの場合、ホバーアニメーションを有効化
      if (splitElement.left) {
        splitElement.left.addEventListener("mouseenter", () => {
          container.classList.add("hover-left");
          setTimeout(() => fadeInElement(splitElement.left?.querySelector(".left__inner")), 600);
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
          }
        });

        splitElement.right.addEventListener("mouseleave", () => {
          container.classList.remove("hover-right");

          if (splitElement.spImage) fadeOutElement(splitElement.spImage);
          if (splitElement.rightText) fadeOutElement(splitElement.rightText);
          if (splitElement.rightLink) fadeOutElement(splitElement.rightLink);
        });
      }
    }

    //icon
    if (splitElement.iconMenuItems.length > 0) {
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

  function fadeInElement(element: any) {
    if (element !== null && element !== undefined) {
      gsap.to(element, {
        opacity: 1,
        duration: 1.2,
        ease: "power1.out",
      });
    }
  }

  function fadeOutElement(element: any) {
    if (element !== null && element !== undefined) {
      gsap.to(element, {
        opacity: 0,
        duration: 1,
        ease: "power1.out",
      });
    }
  }

  // テキストアニメーション
  function addStyledText(element: any, delay: any) {
    const textContent = element?.textContent;
    const text = textContent !== null && textContent !== undefined ? textContent : "";
    const newText = [...text].map((char: any) => `<span>${char}</span>`);
    element.innerHTML = newText.join("");

    Array.from(element.children).forEach((char: any, index: any) => {
      setTimeout(() => char.classList.add("is-active"), delay * index);
    });
  }
}

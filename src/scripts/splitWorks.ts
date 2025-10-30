// split
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// GSAPプラグインを登録
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
    const splitElement: SplitElement = {
      containers: container as HTMLDivElement,
      left: container.querySelector(".left") as HTMLDivElement,
      right: container.querySelector(".right") as HTMLDivElement,
      rightHeader: container.querySelector(".right__header") as HTMLElement,
      rightText: container.querySelector(".right__text") as HTMLElement,
      spImage: container.querySelector(".right__spImage") as HTMLImageElement,
      rightLink: container.querySelector(".right__link") as HTMLAnchorElement,
      iconMenuItems: container.querySelectorAll(".right__iconMenu_item"),
    };

    // スマホサイズの場合、パララックス効果とスクロールアニメーション
    if (isMobile) {
      // 右サイドの要素を即座に表示
      if (splitElement.spImage) {
        gsap.set(splitElement.spImage, { opacity: 1 });
      }
      // スマホサイズでは.right__textにaddStyledTextを適用しない（HTMLの構造を保持）
      if (splitElement.rightText) {
        gsap.set(splitElement.rightText, { opacity: 1 });
      }
      if (splitElement.rightLink) {
        gsap.set(splitElement.rightLink, { opacity: 1 });
        if (splitElement.rightLink.textContent !== null && splitElement.rightLink.textContent !== "") {
          addStyledText(splitElement.rightLink, 100);
        }
      }
      if (
        splitElement.rightHeader &&
        splitElement.rightHeader.textContent !== null &&
        splitElement.rightHeader.textContent !== ""
      ) {
        addStyledText(splitElement.rightHeader, 200);
      }

      // 左サイドを初期状態で表示（.rightの上を被さる）
      if (splitElement.left) {
        // 左サイドは通常表示
        gsap.set(splitElement.left, {
          opacity: 1,
          y: 0,
        });

        const leftInner = splitElement.left.querySelector(".left__inner");
        if (leftInner) {
          gsap.set(leftInner, {
            opacity: 1,
            y: 0,
          });
        }

        // 左サイドがスクロールで登場するフェードイン効果
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

        // 左サイド内の画像にパララックス効果
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
          // .right__textにはaddStyledTextを適用しない（WordPressから来るspan構造を保持）
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
}

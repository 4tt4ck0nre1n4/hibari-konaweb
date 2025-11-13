import { useState, useEffect, useRef, useLayoutEffect } from "react";
import hamburgerStyles from "../styles/hamburgerStyles.module.css";
import ReactDOM from "react-dom";
import { Icon } from "@iconify/react";

const menuItems = [
  {
    label: "Home",
    href: "/",
    ariaLabel: "トップページへ戻る",
    ariaTitle: "トップページへ戻る",
    icon: "flat-color-icons:home",
  },
  {
    label: "About",
    href: "/about",
    ariaLabel: "アバウトページへ",
    ariaTitle: "アバウトページへ",
    icon: "streamline-ultimate-color:laptop-user",
  },
  {
    label: "Works",
    href: "/works",
    ariaLabel: "ワークスページへ",
    ariaTitle: "ワークスページへ",
    icon: "twemoji:woman-technologist-medium-light-skin-tone",
  },
  {
    label: "Blog",
    href: "/blog",
    ariaLabel: "ブログページへ",
    ariaTitle: "ブログページへ",
    icon: "vscode-icons:file-type-libreoffice-writer",
  },
  {
    label: "Contact",
    href: "/contact",
    ariaLabel: "お問い合わせページへ",
    ariaTitle: "お問い合わせページへ",
    icon: "fluent-emoji-flat:envelope",
  },
];

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const [currentPath, setCurrentPath] = useState("");
  const [portalTarget, setPortalTarget] = useState<Element | null>(null);
  const firstMenuLinkRef = useRef<HTMLAnchorElement | null>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  const closeMenu = () => setIsOpen(false);
  const toggleMenu = () => {
    if (!isOpen) {
      previouslyFocusedElementRef.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
    }
    setIsOpen((prev) => !prev);
  };

  // 現在のパスを取得
  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    setPortalTarget(document.getElementById("overlay-root"));
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const updateOverlayMetrics = () => {
      const menuEl = menuRef.current;
      const overlayEl = overlayRef.current;

      if (!menuEl || !overlayEl) return;

      const rect = menuEl.getBoundingClientRect();
      const top = Math.max(rect.top, 0);
      const left = Math.max(rect.left, 0);
      const width = Math.max(rect.width, 0);
      const height = Math.max(rect.height, 0);

      overlayEl.style.setProperty("--menu-top", `${top}px`);
      overlayEl.style.setProperty("--menu-left", `${left}px`);
      overlayEl.style.setProperty("--menu-width", `${width}px`);
      overlayEl.style.setProperty("--menu-height", `${height}px`);
    };

    const handleResize = () => {
      requestAnimationFrame(updateOverlayMetrics);
    };

    handleResize();

    const resizeObserver = typeof ResizeObserver !== "undefined" ? new ResizeObserver(handleResize) : null;
    if (resizeObserver && menuRef.current) {
      resizeObserver.observe(menuRef.current);
    }

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize, true);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize, true);
      resizeObserver?.disconnect();
    };
  }, [isOpen]);

  const getMenuFocusableElements = () => {
    const elements: HTMLElement[] = [];
    if (menuRef.current) {
      elements.push(
        ...Array.from(
          menuRef.current.querySelectorAll<HTMLElement>("a[href], button, [tabindex]:not([tabindex='-1'])")
        ).filter((element) => !element.hasAttribute("disabled") && element.getAttribute("aria-hidden") !== "true")
      );
    }
    if (buttonRef.current) {
      elements.push(buttonRef.current);
    }
    return elements;
  };

  useEffect(() => {
    if (buttonRef.current) {
      buttonRef.current.setAttribute("aria-expanded", isOpen ? "true" : "false");
    }
    if (menuRef.current) {
      menuRef.current.setAttribute("aria-hidden", isOpen ? "false" : "true");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!isOpen) return;

      const target = e.target as HTMLElement | null;
      if (!target) return;

      const menuEl = menuRef.current;
      if (menuEl && menuEl.contains(target)) return;

      const buttonEl = buttonRef.current;
      if (buttonEl && buttonEl.contains(target)) return;

      const overlayEl = overlayRef.current;
      if (overlayEl && overlayEl.contains(target)) {
        const clickableSegment = target.closest("[data-position]");
        if (clickableSegment) {
          closeMenu();
        }
        return;
      }

      closeMenu();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();

      if (e.key === "Tab" && isOpen) {
        const focusable = getMenuFocusableElements();

        if (focusable.length === 0) return;

        const preferredFirst =
          firstMenuLinkRef.current && focusable.includes(firstMenuLinkRef.current)
            ? firstMenuLinkRef.current
            : (focusable.find((element) => element !== buttonRef.current) ?? focusable[0]);
        const lastElement = focusable[focusable.length - 1];
        const activeElement = document.activeElement as HTMLElement | null;
        const menuElement = menuRef.current;
        const isFocusInMenu = Boolean(
          activeElement && menuElement && (menuElement.contains(activeElement) || activeElement === buttonRef.current)
        );

        if (!e.shiftKey && !isFocusInMenu) {
          e.preventDefault();
          preferredFirst?.focus({ preventScroll: true });
          return;
        }

        if (!e.shiftKey && activeElement === buttonRef.current) {
          e.preventDefault();
          preferredFirst?.focus({ preventScroll: true });
          return;
        }

        if (e.shiftKey && activeElement === preferredFirst) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && activeElement === lastElement) {
          e.preventDefault();
          preferredFirst?.focus();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    // CLS対策: scrollbar-gutterがあるためbodyのoverflowでも問題なし
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  useIsomorphicLayoutEffect(() => {
    if (isOpen) {
      const focusMenu = () => {
        const focusable = getMenuFocusableElements();
        const preferred = firstMenuLinkRef.current;
        const firstElement =
          preferred && focusable.includes(preferred)
            ? preferred
            : (focusable.find((element) => element !== buttonRef.current) ?? focusable[0]);
        firstElement?.focus({ preventScroll: true });
      };
      const rAF = requestAnimationFrame(() => {
        requestAnimationFrame(focusMenu);
      });
      return () => cancelAnimationFrame(rAF);
    }

    const previous = previouslyFocusedElementRef.current;
    if (previous) {
      requestAnimationFrame(() => {
        previous.focus();
      });
      previouslyFocusedElementRef.current = null;
    }

    return undefined;
  }, [isOpen]);

  const overlayNode = isOpen ? (
    <div
      ref={overlayRef}
      className={`${hamburgerStyles.hamburger__overlay} ${hamburgerStyles.hamburger__overlay_open}`}
      aria-hidden="true"
    >
      <div className={hamburgerStyles.hamburger__overlay_segments}>
        <div
          className={hamburgerStyles.hamburger__overlay_segment}
          data-position="top"
          onClick={closeMenu}
          role="presentation"
        />
        <div
          className={hamburgerStyles.hamburger__overlay_segment}
          data-position="bottom"
          onClick={closeMenu}
          role="presentation"
        />
        <div
          className={hamburgerStyles.hamburger__overlay_segment}
          data-position="left"
          onClick={closeMenu}
          role="presentation"
        />
        <div
          className={hamburgerStyles.hamburger__overlay_segment}
          data-position="right"
          onClick={closeMenu}
          role="presentation"
        />
      </div>
    </div>
  ) : null;

  const menuNode = (
    <div
      id="hamburger-menu"
      ref={menuRef}
      className={`${hamburgerStyles.hamburger__menu} ${isOpen ? hamburgerStyles.open : ""}`}
      aria-hidden="true"
    >
      <ul>
        {menuItems.map(({ label, href, icon, ariaLabel, ariaTitle }, index) => {
          const isActive = currentPath === href || (href !== "/" && currentPath.startsWith(href));
          return (
            <li key={label} className={hamburgerStyles.hamburger__menu_item}>
              <a
                className={`${hamburgerStyles.hamburger__menu_link} ${isActive ? hamburgerStyles.active : ""}`}
                href={href}
                onClick={closeMenu}
                aria-label={ariaLabel}
                aria-current={isActive ? "page" : undefined}
                title={ariaTitle}
                ref={index === 0 ? firstMenuLinkRef : undefined}
              >
                {typeof icon === "string" && icon?.trim() !== "" ? (
                  <Icon icon={icon} className={hamburgerStyles.hamburger__menu_icon} width="36" height="36" />
                ) : null}
                <span className={hamburgerStyles.hamburger__menu_label}>{label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );

  const menuWithOverlay = portalTarget ? (
    ReactDOM.createPortal(
      <>
        {overlayNode}
        {menuNode}
      </>,
      portalTarget
    )
  ) : (
    <>
      {overlayNode}
      {menuNode}
    </>
  );

  const buttonNode = (
    <button
      ref={buttonRef}
      className={`${hamburgerStyles.hamburger__button} ${isOpen ? hamburgerStyles.open : ""}`}
      onClick={toggleMenu}
      aria-label={isOpen ? "メニューを閉じる" : "メニューを開く"}
      aria-expanded="false"
      aria-controls="hamburger-menu"
      tabIndex={0}
      type="button"
    >
      <span className={hamburgerStyles.hamburger__line} />
    </button>
  );

  const buttonWithPortal = portalTarget && isOpen ? ReactDOM.createPortal(buttonNode, portalTarget) : buttonNode;


  return (
    <>
      {buttonWithPortal}
      {menuWithOverlay}
    </>
  );
};

export default HamburgerMenu;

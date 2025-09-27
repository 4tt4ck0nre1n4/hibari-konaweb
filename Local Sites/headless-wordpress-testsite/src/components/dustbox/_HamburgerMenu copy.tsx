import { useState, useEffect, useRef } from "react";
import hamburgerStyles from "../styles/hamburgerStyles.module.css";
import ReactDOM from "react-dom";
import { Icon } from "@iconify/react";

const menuItems = [
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
    icon: "flat-color-icons:contacts",
    // icon: "fluent-emoji-flat:envelope",
  },
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
];

const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        !(buttonRef.current && buttonRef.current.contains(e.target as Node))
      ) {
        closeMenu();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();

      if (e.key === "Tab" && isOpen) {
        const focusable = [
          ...(buttonRef.current ? [buttonRef.current] : []),
          ...(menuRef.current?.querySelectorAll<HTMLElement>(
            "a[href], button:not(.hamburger__button), [tabindex]:not([tabindex='-1'])"
          ) ?? []),
        ];

        if (focusable.length === 0) return;

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = isOpen ? "hidden" : "auto";

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <button
        ref={buttonRef}
        className={`${hamburgerStyles.hamburger__button} ${isOpen ? hamburgerStyles.open : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "メニューを閉じる" : "メニューを開く"}
        aria-expanded={isOpen ? "true" : "false"}
        aria-controls="hamburger__menu"
        tabIndex={0}
        type="button"
      >
        <span className={hamburgerStyles.hamburger__line} />
      </button>

      {isOpen &&
        ReactDOM.createPortal(
          <div className={hamburgerStyles.hamburger__overlay} onClick={closeMenu} />,
          document.getElementById("overlay-root")!
        )}

      <div
        id={hamburgerStyles.hamburger__menu}
        ref={menuRef}
        className={`${hamburgerStyles.hamburger__menu} ${isOpen ? hamburgerStyles.open : ""}`}
        aria-hidden={isOpen ? "false" : "true"}
      >
        <ul>
          {menuItems.map(({ label, href, icon }) => (
            <li key={label} className={hamburgerStyles.hamburger__menu_item}>
              <a
                className={hamburgerStyles.hamburger__menu_link}
                href={href}
                onClick={() => {
                  console.log("navigating to", href);
                  closeMenu();
                }}
                aria-label={`${label}ページへ`}
                title={`${label}ページへ`}
              >
                {(() => {
                  console.log("Rendering icon:", icon);
                  return typeof icon === "string" && icon?.trim() !== "" ? (
                    <Icon icon={icon} className={hamburgerStyles.hamburger__menu_icon} width="32" height="32" />
                  ) : null;
                })()}
                <span className={hamburgerStyles.hamburger__menu_label}>{label}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default HamburgerMenu;

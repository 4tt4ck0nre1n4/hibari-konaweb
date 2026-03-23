/**
 * GA4 gtag.js の遅延読み込み（Layout.astro から data-ga-id で Measurement ID を渡す）
 */
(function () {
  "use strict";

  var GA_MEASUREMENT_ID =
    document.currentScript && document.currentScript.getAttribute("data-ga-id");
  if (!GA_MEASUREMENT_ID) {
    return;
  }

  // 一度だけ実行されるようにフラグを設定
  var isLoaded = false;
  var timeoutId = null;
  var scrollEventListeners = [];

  /**
   * Google Analytics スクリプトを読み込む
   * 一度だけ実行される（isLoadedフラグで制御）
   */
  function loadGoogleAnalytics() {
    if (isLoaded) {
      return;
    }

    isLoaded = true;

    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    removeScrollListeners();

    var script = document.createElement("script");
    script.async = true;
    script.src =
      "https://www.googletagmanager.com/gtag/js?id=" +
      encodeURIComponent(GA_MEASUREMENT_ID);

    script.onerror = function (error) {
      console.warn("[Google Analytics] スクリプトの読み込みに失敗しました", error);
    };

    script.onload = function () {
      try {
        if (window.dataLayer && window.gtag) {
          // head 内の GoogleAnalytics.astro で初期化済み
        }
      } catch (e) {
        console.warn("[Google Analytics] 初期化中にエラーが発生しました", e);
      }
    };

    document.head.appendChild(script);
  }

  function removeScrollListeners() {
    scrollEventListeners.forEach(function (listener) {
      window.removeEventListener(listener.event, listener.handler, { passive: true });
    });
    scrollEventListeners = [];
  }

  function getScreenWidth() {
    return (
      window.innerWidth ||
      document.documentElement.clientWidth ||
      document.body.clientWidth ||
      0
    );
  }

  function initGoogleAnalytics() {
    var screenWidth = getScreenWidth();

    if ("IntersectionObserver" in window) {
      var marker = document.createElement("div");
      marker.style.position = "absolute";
      marker.style.bottom = "200px";
      marker.style.width = "1px";
      marker.style.height = "1px";
      marker.style.pointerEvents = "none";
      marker.style.visibility = "hidden";
      document.body.appendChild(marker);

      var observer = new IntersectionObserver(
        function (entries) {
          var isVisible = entries.some(function (entry) {
            return entry.isIntersecting;
          });

          if (isVisible && !isLoaded) {
            observer.disconnect();
            document.body.removeChild(marker);
            loadGoogleAnalytics();
          }
        },
        {
          rootMargin: "200px 0px",
          threshold: 0.01,
        }
      );

      observer.observe(marker);

      timeoutId = setTimeout(function () {
        if (!isLoaded) {
          observer.disconnect();
          if (document.body.contains(marker)) {
            document.body.removeChild(marker);
          }
          loadGoogleAnalytics();
        }
      }, 10000);
    } else {
      if (screenWidth <= 768) {
        var SCROLL_THRESHOLD_MOBILE = 50;
        var hasScrolledMobile = false;

        function handleScrollMobile() {
          var scrollY = window.scrollY || document.documentElement.scrollTop || 0;

          if (!hasScrolledMobile && scrollY >= SCROLL_THRESHOLD_MOBILE) {
            hasScrolledMobile = true;
            loadGoogleAnalytics();
          }
        }

        var scrollHandlerM = { event: "scroll", handler: handleScrollMobile };
        var wheelHandlerM = { event: "wheel", handler: handleScrollMobile };
        var touchHandlerM = { event: "touchstart", handler: handleScrollMobile };

        window.addEventListener("scroll", handleScrollMobile, { passive: true });
        window.addEventListener("wheel", handleScrollMobile, { passive: true });
        window.addEventListener("touchstart", handleScrollMobile, { passive: true });

        scrollEventListeners.push(scrollHandlerM, wheelHandlerM, touchHandlerM);

        timeoutId = setTimeout(function () {
          if (!isLoaded) {
            loadGoogleAnalytics();
          }
        }, 10000);

        var currentScrollYM = window.scrollY || document.documentElement.scrollTop || 0;
        if (currentScrollYM >= SCROLL_THRESHOLD_MOBILE) {
          loadGoogleAnalytics();
        }
      } else if (screenWidth >= 1024) {
        if ("requestIdleCallback" in window) {
          requestIdleCallback(
            function () {
              loadGoogleAnalytics();
            },
            { timeout: 5000 }
          );
        } else {
          if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", function () {
              loadGoogleAnalytics();
            });
          } else {
            loadGoogleAnalytics();
          }
        }

        timeoutId = setTimeout(function () {
          if (!isLoaded) {
            loadGoogleAnalytics();
          }
        }, 10000);
      } else {
        var SCROLL_THRESHOLD_MID = 50;
        var hasScrolledMid = false;

        function handleScrollMid() {
          var scrollY = window.scrollY || document.documentElement.scrollTop || 0;

          if (!hasScrolledMid && scrollY >= SCROLL_THRESHOLD_MID) {
            hasScrolledMid = true;
            loadGoogleAnalytics();
          }
        }

        var scrollHandlerMid = { event: "scroll", handler: handleScrollMid };
        var wheelHandlerMid = { event: "wheel", handler: handleScrollMid };
        var touchHandlerMid = { event: "touchstart", handler: handleScrollMid };

        window.addEventListener("scroll", handleScrollMid, { passive: true });
        window.addEventListener("wheel", handleScrollMid, { passive: true });
        window.addEventListener("touchstart", handleScrollMid, { passive: true });

        scrollEventListeners.push(scrollHandlerMid, wheelHandlerMid, touchHandlerMid);

        timeoutId = setTimeout(function () {
          if (!isLoaded) {
            loadGoogleAnalytics();
          }
        }, 10000);

        var currentScrollYMid = window.scrollY || document.documentElement.scrollTop || 0;
        if (currentScrollYMid >= SCROLL_THRESHOLD_MID) {
          loadGoogleAnalytics();
        }
      }
    }
  }

  initGoogleAnalytics();
})();

/* ==========================================================================
   CharlotMuff — 个人作品集
   交互脚本（原生 JavaScript，无第三方依赖）

   模块
   01. 工具函数
   02. 移动端导航菜单
   03. 导航滚动状态与定位
   04. 作品分类筛选
   05. 项目详情弹窗
   06. 页脚年份
   07. 返回顶部
   08. 初始化
   ========================================================================== */

(function () {
  "use strict";

  /* ========================================================================
     01. 工具函数
     ======================================================================== */

  function $(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function $$(selector, scope) {
    return Array.prototype.slice.call(
      (scope || document).querySelectorAll(selector)
    );
  }

  /** 是否开启了"减少动态效果" */
  function prefersReducedMotion() {
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  /* ========================================================================
     02. 移动端导航菜单
     ======================================================================== */

  function initMobileNav() {
    var toggle = $(".nav-toggle");
    var nav = $("#site-nav");
    if (!toggle || !nav) return;

    function setOpen(open) {
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      nav.classList.toggle("is-open", open);
      toggle.setAttribute(
        "aria-label",
        open ? "关闭导航菜单" : "打开导航菜单"
      );
    }

    function isOpen() {
      return toggle.getAttribute("aria-expanded") === "true";
    }

    toggle.addEventListener("click", function () {
      setOpen(!isOpen());
    });

    // 点击菜单项后自动收起
    $$(".site-nav__link", nav).forEach(function (link) {
      link.addEventListener("click", function () {
        if (isOpen()) setOpen(false);
      });
    });

    // 点击菜单外部区域收起
    document.addEventListener("click", function (event) {
      if (!isOpen()) return;
      if (nav.contains(event.target) || toggle.contains(event.target)) return;
      setOpen(false);
    });

    // Escape 键收起菜单，并把焦点还给按钮
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && isOpen()) {
        setOpen(false);
        toggle.focus();
      }
    });

    // 视口放大到桌面尺寸时复位菜单状态
    var desktop = window.matchMedia("(min-width: 721px)");
    var onChange = function (event) {
      if (event.matches) setOpen(false);
    };
    if (desktop.addEventListener) {
      desktop.addEventListener("change", onChange);
    } else if (desktop.addListener) {
      desktop.addListener(onChange);
    }
  }

  /* ========================================================================
     03. 导航滚动状态与定位
     ======================================================================== */

  function initScrollBehaviour() {
    var header = $(".site-header");
    var navLinks = $$(".site-nav__link");
    var toTop = $("#to-top");
    var sections = navLinks
      .map(function (link) {
        var id = link.getAttribute("href");
        if (!id || id.charAt(0) !== "#") return null;
        return $(id);
      })
      .filter(Boolean);

    function onScroll() {
      var y = window.pageYOffset || document.documentElement.scrollTop;

      if (header) {
        header.classList.toggle("is-scrolled", y > 20);
      }

      if (toTop) {
        toTop.hidden = y < 600;
      }

      // 高亮当前所在区块
      var current = null;
      var offset = y + (header ? header.offsetHeight : 0) + 120;
      sections.forEach(function (section) {
        if (section.offsetTop <= offset) current = section;
      });

      navLinks.forEach(function (link) {
        var target = link.getAttribute("href");
        var active =
          current && link.getAttribute("href") === "#" + current.id;
        link.classList.toggle("is-active", Boolean(active));
      });
    }

    var ticking = false;
    function requestUpdate() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        onScroll();
        ticking = false;
      });
    }

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    onScroll();
  }

  /* ========================================================================
     04. 作品分类筛选
     ======================================================================== */

  function initFilter() {
    var filterList = $("#work-filters");
    var grid = $("#work-grid");
    var status = $("#filter-status");
    var empty = $("#works-empty");
    if (!filterList || !grid) return;

    var buttons = $$("[data-filter]", filterList);
    var cards = $$(".work-card", grid);

    var CATEGORY_LABEL = {
      all: "全部作品",
      graphic: "平面设计",
      exhibition: "展会策划与物料设计",
      video: "视频作品",
      "3d": "三维设计"
    };

    function apply(filter) {
      var shown = 0;

      cards.forEach(function (card) {
        var match = filter === "all" || card.dataset.category === filter;
        card.classList.toggle("is-hidden", !match);
        if (match) shown += 1;
      });

      buttons.forEach(function (button) {
        var active = button.dataset.filter === filter;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", active ? "true" : "false");
      });

      if (status) {
        var label = CATEGORY_LABEL[filter] || "筛选结果";
        status.textContent =
          filter === "all"
            ? "显示全部 " + shown + " 个项目"
            : label + " — 显示 " + shown + " 个项目";
      }

      // 该分类暂无作品时显示空状态提示
      if (empty) {
        empty.hidden = shown !== 0;
      }
    }

    filterList.addEventListener("click", function (event) {
      var button = event.target.closest("[data-filter]");
      if (!button) return;
      apply(button.dataset.filter);
    });

    // 左右方向键在筛选按钮间移动
    filterList.addEventListener("keydown", function (event) {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;

      var index = buttons.indexOf(document.activeElement);
      if (index === -1) return;

      event.preventDefault();
      var next =
        event.key === "ArrowRight"
          ? (index + 1) % buttons.length
          : (index - 1 + buttons.length) % buttons.length;
      buttons[next].focus();
    });
  }

  /* ========================================================================
     05. 项目详情弹窗
     ======================================================================== */

  function initModal() {
    var modal = $("#work-modal");
    if (!modal) return;

    var panel = $(".modal__panel", modal);
    var titleEl = $("#modal-title");
    var catEl = $("#modal-cat");
    var descEl = $("#modal-desc");
    var indexEl = $("#modal-index");
    var visualEl = $("#modal-visual");
    var closeBtn = $(".modal__close", modal);
    var lastFocused = null;

    function open(trigger) {
      var card = trigger.closest(".work-card");
      if (!card) return;

      var article = $(".work", card);
      var title = $(".work__title", article);
      var cat = $(".work__cat", article);
      var desc = $(".work__desc", article);
      var index = $(".work__index", article);
      var media = $(".work__media", article);

      if (titleEl && title) titleEl.textContent = title.textContent.trim();
      if (catEl && cat) catEl.textContent = cat.textContent.trim();
      // 描述为可选字段，缺失时清空内容
      if (descEl) descEl.textContent = desc ? desc.textContent.trim() : "";
      if (indexEl && index) indexEl.textContent = index.textContent.trim();

      // 把卡片里的作品图搬进弹窗
      if (visualEl) {
        visualEl.innerHTML = "";
        if (media) {
          var clone = media.cloneNode(true);
          clone.removeAttribute("id");
          visualEl.appendChild(clone);
        }
      }

      lastFocused = trigger;
      modal.hidden = false;
      document.body.classList.add("is-locked");

      if (closeBtn) closeBtn.focus();
    }

    function close() {
      if (modal.hidden) return;
      modal.hidden = true;
      document.body.classList.remove("is-locked");
      if (visualEl) visualEl.innerHTML = "";
      if (lastFocused && typeof lastFocused.focus === "function") {
        lastFocused.focus();
      }
      lastFocused = null;
    }

    // 打开弹窗
    $$("[data-open-work]").forEach(function (button) {
      button.addEventListener("click", function () {
        open(button);
      });
    });

    // 关闭按钮 / 遮罩
    $$("[data-close-modal]", modal).forEach(function (element) {
      element.addEventListener("click", close);
    });

    // Escape 关闭
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !modal.hidden) {
        close();
      }
    });

    // 焦点在弹窗内循环
    modal.addEventListener("keydown", function (event) {
      if (event.key !== "Tab") return;

      var focusables = $$(
        'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])',
        panel
      ).filter(function (element) {
        return element.offsetParent !== null;
      });

      if (!focusables.length) return;

      var first = focusables[0];
      var last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    // 点击遮罩区域（面板之外）关闭
    modal.addEventListener("mousedown", function (event) {
      if (event.target === modal) close();
    });
  }

  /* ========================================================================
     06. 页脚年份
     ======================================================================== */

  function initYear() {
    var year = $("#year");
    if (!year) return;
    year.textContent = String(new Date().getFullYear());
  }

  /* ========================================================================
     07. 返回顶部
     ======================================================================== */

  function initToTop() {
    var button = $("#to-top");
    if (!button) return;

    button.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion() ? "auto" : "smooth"
      });
    });
  }

  /* ========================================================================
     08. 初始化
     ======================================================================== */

  function init() {
    initMobileNav();
    initScrollBehaviour();
    initFilter();
    initModal();
    initYear();
    initToTop();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

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

  /**
   * B 站视频作品配置
   *
   * 新增视频作品时，只需在此追加一条记录，并在 index.html 对应卡片的
   * <li class="work-card"> 上加上 data-video-id="<配置的 id>"。
   * 播放逻辑、弹窗、筛选等均无需改动。
   *
   * 字段说明：
   *   id          唯一标识，与卡片上的 data-video-id 对应
   *   title       作品名称
   *   category    分类标识，需与卡片 data-category 一致
   *   poster      封面图路径
   *   bvid        B 站 BV 号 —— 留空则不创建播放器，仅显示待配置提示
   *   page        分 P 序号，默认 1
   *   description 作品描述（可选）
   */
  var VIDEO_CONFIG = {
    rebirth: {
      id: "rebirth",
      title: "短片《返生》",
      category: "video",
      poster: "assets/img/optimized/recovery-cover.jpg",
      bvid: "BV1pdsB61EVy", // B 站 BV 号
      page: 1,
      description: "独立短片"
    },
    otherVideo: {
      id: "otherVideo",
      title: "其他视频作品",
      category: "video",
      poster: "assets/img/optimized/other-video-cover.jpg",
      bvid: "BV1JKsr62EgU", // B 站 BV 号
      page: 1,
      description: "作品阐述"
    },
    aiVideo: {
      id: "aiVideo",
      title: "AI 视频作品",
      category: "video",
      poster: "assets/img/optimized/ai-video-cover.jpg",
      bvid: "BV1uTsb6tEua", // B 站 BV 号
      page: 1,
      description: "AI 辅助创作"
    }
  };

  /** B 站官方播放器地址（不使用任何第三方播放器库） */
  function bilibiliPlayerUrl(bvid, page) {
    return (
      "https://player.bilibili.com/player.html?bvid=" +
      encodeURIComponent(bvid) +
      "&page=" +
      encodeURIComponent(page || 1) +
      "&high_quality=1"
    );
  }

  /** B 站视频页地址 —— 作为无法嵌入时的备用入口 */
  function bilibiliVideoUrl(bvid) {
    return "https://www.bilibili.com/video/" + encodeURIComponent(bvid);
  }

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
    var noteEl = $("#modal-note");
    var closeBtn = $(".modal__close", modal);
    var lastFocused = null;

    // 视频分支的运行时状态
    var playerTimer = null;

    /**
     * 清理视频播放器：移除 iframe 并停止计时器。
     * 移除 iframe 即终止 B 站播放器的播放。
     */
    function destroyPlayer() {
      if (playerTimer) {
        clearTimeout(playerTimer);
        playerTimer = null;
      }
      if (visualEl) {
        visualEl.innerHTML = "";
        visualEl.classList.remove("modal__visual--video");
      }
    }

    /**
     * 渲染 B 站播放器（视频分支）。
     *
     * 仅在用户点击视频卡片后调用，iframe 在此刻才被创建。
     * 若配置中没有真实 BV 号，则不创建任何 iframe，只显示待配置提示。
     */
    function renderVideo(videoId) {
      var config = VIDEO_CONFIG[videoId];
      if (!config) return false;

      var bvid = (config.bvid || "").trim();
      if (!visualEl) return false;

      // 无论走哪条分支，都先清空上一次的媒体内容
      destroyPlayer();
      visualEl.classList.add("modal__visual--video");

      var stage = document.createElement("div");
      stage.className = "player";

      var frame = document.createElement("div");
      frame.className = "player__frame";

      var loading = document.createElement("p");
      loading.className = "player__loading";
      loading.textContent = "正在加载播放器…";

      var hint = document.createElement("p");
      hint.className = "player__hint";
      hint.hidden = true;

      stage.appendChild(loading);
      stage.appendChild(hint);

      // 未配置真实 BV 号：不创建播放器，也不显示外链；
      // 此时不渲染空的播放区域，避免出现大片空白。
      if (!bvid) {
        stage.classList.add("player--pending");
        loading.textContent = "该视频尚未配置 B 站 BV 号，播放器暂不可用。";
        visualEl.appendChild(stage);
        return true;
      }

      stage.appendChild(frame);

      // 备用入口：视频无法嵌入时仍可前往 B 站观看
      var fallback = document.createElement("a");
      fallback.className = "player__fallback";
      fallback.href = bilibiliVideoUrl(bvid);
      fallback.target = "_blank";
      fallback.rel = "noopener noreferrer";
      fallback.textContent = "在 B 站打开";
      stage.appendChild(fallback);

      var iframe = document.createElement("iframe");
      iframe.className = "player__iframe";
      iframe.src = bilibiliPlayerUrl(bvid, config.page);
      iframe.title = config.title + "（B 站播放器）";
      iframe.allow =
        "autoplay; encrypted-media; picture-in-picture; fullscreen";
      iframe.allowFullscreen = true;
      iframe.setAttribute("allowfullscreen", "");
      // 使用浏览器默认同源策略（仅发送来源站点），兼容性最好
      iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
      iframe.setAttribute("loading", "lazy");

      // load 事件仅代表 iframe 文档加载完成，不代表视频一定可以播放，
      // 因此这里只结束"加载中"状态，不做任何"播放成功"的判断。
      iframe.addEventListener("load", function () {
        loading.hidden = true;
        if (playerTimer) {
          clearTimeout(playerTimer);
          playerTimer = null;
        }
      });

      // 超时只提示"加载异常"，无法判断 B 站内部的播放错误
      playerTimer = setTimeout(function () {
        playerTimer = null;
        loading.hidden = true;
        hint.hidden = false;
        hint.textContent =
          "播放器加载较慢或未能完成。若长时间黑屏，可能是该视频不允许嵌入、尚未公开，或 BV 号有误 —— 可尝试点击下方「在 B 站打开」。";
      }, 10000);

      frame.appendChild(iframe);
      visualEl.appendChild(stage);
      return true;
    }

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

      // 视频作品走独立分支；普通图片作品沿用原有的克隆展示逻辑
      var videoId = card.getAttribute("data-video-id");
      if (videoId && VIDEO_CONFIG[videoId]) {
        var config = VIDEO_CONFIG[videoId];
        if (descEl && config.description) {
          descEl.textContent = config.description;
        }
        if (noteEl) {
          noteEl.textContent =
            "视频在页面内直接播放。如需了解更多该作品，请通过 GitHub 联系我。";
        }
        renderVideo(videoId);
      } else if (visualEl) {
        // 普通图片作品：沿用原有的克隆展示逻辑
        if (noteEl) {
          noteEl.textContent =
            "作品完整画面如上。如需了解更多该作品，请通过 GitHub 联系我。";
        }
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
      // 移除 iframe，停止视频播放
      destroyPlayer();
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

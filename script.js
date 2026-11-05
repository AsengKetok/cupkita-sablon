document.addEventListener("DOMContentLoaded", function () {
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var nav = document.getElementById("nav");
  var toggle = document.querySelector(".nav-toggle");
  var isMobile = function () { return window.matchMedia("(max-width: 900px)").matches; };

  /* -----------------------------------------------------
     1. Navigasi
     ----------------------------------------------------- */
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Tutup menu" : "Buka menu");
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Buka menu");
        toggle.focus();
      }
    });

    window.addEventListener("resize", function () {
      if (!isMobile() && nav.classList.contains("open")) {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Sub menu di mobile: ketuk menu utama untuk buka/tutup
  document.querySelectorAll(".has-sub > a").forEach(function (link) {
    link.addEventListener("click", function (e) {
      if (isMobile()) {
        e.preventDefault();
        link.parentElement.classList.toggle("open");
      }
    });
  });

  // Tutup menu mobile setelah memilih sub menu
  document.querySelectorAll(".submenu a").forEach(function (a) {
    a.addEventListener("click", function () {
      if (nav && toggle) {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Buka menu");
      }
    });
  });

  // Tandai menu aktif
  var file = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".menu > li > a").forEach(function (a) {
    if (a.getAttribute("href") === file) a.classList.add("active");
  });

  /* -----------------------------------------------------
     2. Tahun footer
     ----------------------------------------------------- */
  var y = document.getElementById("tahun");
  if (y) y.textContent = new Date().getFullYear();

  /* -----------------------------------------------------
     3. Scroll reveal + stagger
     ----------------------------------------------------- */
  document.querySelectorAll("[data-reveal-group]").forEach(function (group) {
    group.querySelectorAll("[data-reveal]").forEach(function (el, i) {
      el.style.setProperty("--delay", Math.min(i, 6) * 80 + "ms");
    });
  });

  var revealEls = document.querySelectorAll("[data-reveal]");
  var canObserve = "IntersectionObserver" in window && !reduceMotion;

  if (!canObserve) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -48px 0px" });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  /* -----------------------------------------------------
     4. Angka statistik berjalan
     ----------------------------------------------------- */
  function countUp(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    if (isNaN(target)) return;
    var decimalPart = (el.getAttribute("data-count").split(".")[1] || "").length;
    if (reduceMotion) {
      el.textContent = target.toFixed(decimalPart);
      return;
    }
    var duration = 1500;
    var start = null;
    function frame(now) {
      if (start === null) start = now;
      var progress = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = (target * eased).toFixed(decimalPart);
      if (progress < 1) requestAnimationFrame(frame);
      else el.textContent = target.toFixed(decimalPart);
    }
    requestAnimationFrame(frame);
  }

  var counters = document.querySelectorAll("[data-count]");
  if (counters.length) {
    if (!("IntersectionObserver" in window)) {
      counters.forEach(countUp);
    } else {
      var countObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            countUp(entry.target);
            countObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.6 });
      counters.forEach(function (el) { countObserver.observe(el); });
    }
  }

  /* -----------------------------------------------------
     5. Parallax ringan pada ilustrasi hero
     ----------------------------------------------------- */
  var hero = document.querySelector(".hero");
  var heroVisual = document.querySelector(".hero-visual");
  var canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (hero && heroVisual && canHover && !reduceMotion) {
    var rafId = null;
    hero.addEventListener("pointermove", function (e) {
      if (rafId) return;
      rafId = requestAnimationFrame(function () {
        var rect = hero.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        heroVisual.style.setProperty("--px", (x * 16).toFixed(1) + "px");
        heroVisual.style.setProperty("--py", (y * 14).toFixed(1) + "px");
        rafId = null;
      });
    });
    hero.addEventListener("pointerleave", function () {
      heroVisual.style.setProperty("--px", "0px");
      heroVisual.style.setProperty("--py", "0px");
    });
  }

  /* -----------------------------------------------------
     6. Progress bar, header, dan tombol ke atas
     ----------------------------------------------------- */
  var progress = document.querySelector(".scroll-progress");
  var header = document.querySelector(".site-header");
  var toTop = document.querySelector(".to-top");

  function onScroll() {
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.transform = "scaleX(" + (max > 0 ? Math.min(scrollTop / max, 1) : 0) + ")";
    if (header) header.classList.toggle("scrolled", scrollTop > 8);
    if (toTop) toTop.classList.toggle("show", scrollTop > 480);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* -----------------------------------------------------
     7. Confetti kecil saat pesan terkirim
     ----------------------------------------------------- */
  function launchConfetti() {
    if (reduceMotion) return;
    var colors = ["#00b8d9", "#f0347f", "#ffd23f", "#7be0c3", "#14213d"];
    for (var i = 0; i < 44; i++) {
      var bit = document.createElement("i");
      bit.className = "confetti";
      bit.setAttribute("aria-hidden", "true");
      bit.style.left = Math.random() * 100 + "vw";
      bit.style.background = colors[i % colors.length];
      bit.style.setProperty("--dx", (Math.random() * 2 - 1) * 180 + "px");
      bit.style.setProperty("--spin", (Math.random() * 720 + 180) + "deg");
      bit.style.animationDelay = (Math.random() * 0.35) + "s";
      bit.style.animationDuration = (1.8 + Math.random() * 1.3) + "s";
      bit.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
      bit.style.width = 6 + Math.random() * 6 + "px";
      bit.addEventListener("animationend", function () { this.remove(); });
      document.body.appendChild(bit);
    }
  }

  /* -----------------------------------------------------
     8. Form kontak (simulasi kirim)
     ----------------------------------------------------- */
  var form = document.getElementById("form-kontak");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var status = document.getElementById("form-status");
      if (!form.checkValidity()) {
        if (status) status.textContent = "Lengkapi nama, email yang valid, dan pesan terlebih dahulu.";
        var invalid = form.querySelector(":invalid");
        if (invalid) invalid.focus();
        return;
      }
      if (status) status.textContent = "Terima kasih, pesan Anda sudah kami terima (simulasi). 🎉";
      form.reset();
      launchConfetti();
    });
  }
});

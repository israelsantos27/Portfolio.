/* script.js
   - Smooth scrolling, active link, mobile menu
   - Theme toggle with localStorage
   - Typing effect (hero)
   - Animated counters
   - Skills progress fill on view
   - Project filtering
   - Scroll-triggered animations via IntersectionObserver
   - Parallax on images
   - Back-to-top button + scroll progress
   - Contact form validation (client-side only, demo submission)
*/

// Utility: query helpers
const $ = (s, rt = document) => rt.querySelector(s);
const $$ = (s, rt = document) => Array.from(rt.querySelectorAll(s));

/* ---------- Theme Toggle (persisted) ---------- */
(function initTheme() {
  const root = document.documentElement;
  const saved = localStorage.getItem("theme");
  if (saved) root.setAttribute("data-theme", saved);
  const btn = $("#themeToggle");
  const setIcon = () => {
    const isLight = root.getAttribute("data-theme") === "light";
    btn.innerHTML = isLight ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
    btn.setAttribute("aria-pressed", String(isLight));
  };
  setIcon();
  btn.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    root.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    setIcon();
  });
})();

/* ---------- Mobile Menu ---------- */
(function initMenu() {
  const toggle = $("#menuToggle");
  const nav = $("#primaryNav");
  const links = $$(".nav-link", nav);

  const close = () => {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  };
  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
  links.forEach(l => l.addEventListener("click", close));
  document.addEventListener("click", (e) => {
    if (!nav.contains(e.target) && !toggle.contains(e.target)) close();
  });
})();

/* ---------- Smooth Scrolling & Active Link ---------- */
(function initSmoothScroll() {
  const OFFSET = 72; // header height buffer
  $$(".nav-link").forEach(link => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (href && href.startsWith("#")) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (!target) return;
        const y = target.getBoundingClientRect().top + window.scrollY - OFFSET;
        window.scrollTo({ top: y, behavior: "smooth" });
        // set aria-current
        $$(".nav-link").forEach(l => l.removeAttribute("aria-current"));
        link.setAttribute("aria-current", "page");
      }
    });
  });
})();

/* ---------- Typing Effect ---------- */
(function initTyping() {
  const el = $(".typed");
  if (!el) return;
  const phrases = [
    "Frontend Developer",
    "UI Engineer",
    "Accessibility Advocate",
    "Performance Tuner"
  ];
  let i = 0, j = 0, typing = true;

  function tick() {
    const word = phrases[i];
    if (typing) {
      j++;
      el.textContent = word.slice(0, j);
      if (j === word.length) { typing = false; setTimeout(tick, 1200); return; }
    } else {
      j--;
      el.textContent = word.slice(0, j);
      if (j === 0) { typing = true; i = (i + 1) % phrases.length; }
    }
    const speed = typing ? 70 : 40;
    setTimeout(tick, speed);
  }
  tick();
})();

/* ---------- IntersectionObserver Animations ---------- */
(function initObservers() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const el = entry.target;
      if (entry.isIntersecting) {
        el.classList.add("visible");
        // Skills progress width fill
        if (el.classList.contains("skills-bars")) {
          $$(".progress > span", el).forEach(bar => {
            const v = bar.style.getPropertyValue("--value") || "0%";
            requestAnimationFrame(() => bar.style.width = v);
          });
        }
        // Counters
        if (el.closest(".stats")) {
          animateCounters();
        }
        io.unobserve(el);
      }
    });
  }, { threshold: 0.18 });

  $$("[data-animate]").forEach(el => io.observe(el));
})();

/* ---------- Animated Counters ---------- */
function animateCounters() {
  $$(".stat").forEach(stat => {
    const target = Number(stat.dataset.counter || 0);
    const numEl = $(".count", stat);
    let cur = 0;
    const duration = 1200;
    const start = performance.now();

    function frame(now) {
      const p = Math.min(1, (now - start) / duration);
      const ease = 1 - Math.pow(1 - p, 3);
      cur = Math.floor(target * ease);
      numEl.textContent = String(cur);
      if (p < 1) requestAnimationFrame(frame);
      else numEl.textContent = String(target);
    }
    requestAnimationFrame(frame);
  });
}

/* ---------- Project Filtering ---------- */
(function initFilters() {
  const buttons = $$(".filter-btn");
  const cards = $$(".project-card");
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => { b.classList.remove("active"); b.setAttribute("aria-selected", "false"); });
      btn.classList.add("active"); btn.setAttribute("aria-selected", "true");

      const f = btn.dataset.filter;
      cards.forEach(card => {
        const show = f === "all" || card.dataset.category === f;
        card.style.display = show ? "grid" : "none";
      });
    });
  });
})();

/* ---------- Parallax (subtle) ---------- */
(function initParallax() {
  const px = $$(".parallax");
  if (!px.length) return;
  let ticking = false;
  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const vh = window.innerHeight;
        px.forEach(el => {
          const r = el.getBoundingClientRect();
          const rel = (r.top + r.height/2 - vh/2) / vh; // -1..1 roughly
          el.style.transform = `translateY(${rel * -12}px)`; // subtle
        });
        ticking = false;
      });
      ticking = true;
    }
  }
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();

/* ---------- Back to Top & Scroll Progress ---------- */
(function initScrollUI() {
  const btn = $("#backToTop");
  const bar = $("#scrollProgressBar");

  function update() {
    const y = window.scrollY;
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const p = h > 0 ? (y / h) * 100 : 0;
    bar.style.width = `${p}%`;
    if (y > 300) btn.classList.add("show");
    else btn.classList.remove("show");
  }
  window.addEventListener("scroll", update, { passive: true });
  update();

  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
})();

/* ---------- Contact Form Validation (client-side) ---------- */
(function initForm() {
  const form = $("#contactForm");
  if (!form) return;
  const status = $(".form-status", form);

  function setError(input, msg) {
    const row = input.closest(".form-row");
    const small = $(".error", row);
    small.textContent = msg || "";
    if (msg) input.setAttribute("aria-invalid", "true");
    else input.removeAttribute("aria-invalid");
  }

  function validate() {
    let ok = true;
    const name = $("#name");
    const email = $("#email");
    const message = $("#message");

    if (!name.value.trim()) { setError(name, "Please enter your name."); ok = false; } else setError(name, "");
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email.value.trim())) { setError(email, "Please enter a valid email."); ok = false; } else setError(email, "");
    if (message.value.trim().length < 10) { setError(message, "Message should be at least 10 characters."); ok = false; } else setError(message, "");
    return ok;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.textContent = "";
    if (!validate()) return;

    // Demo submission (no backend). Replace with your endpoint (Netlify, Formspree, etc.)
    // Example: fetch("[formspree.io](https://formspree.io/f/xxxxxxx)", { method: "POST", body: new FormData(form), headers: { "Accept": "application/json" } })
    // For now, simulate success:
    await new Promise(r => setTimeout(r, 600));
    status.textContent = "Thanks! Your message has been sent.";
    form.reset();
  });
})();

/* ---------- Footer Year ---------- */
(function setYear() {
  const y = new Date().getFullYear();
  const el = $("#year");
  if (el) el.textContent = y;
})();

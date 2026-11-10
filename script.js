const toggle = document.querySelector(".menu-button");
const nav = document.querySelector(".mobile-nav");
const navLinks = document.querySelectorAll(".desktop-nav a");
const sections = document.querySelectorAll("main section[id]");
const services = document.querySelectorAll(".service-item");
const countdown = document.querySelector("#launch-countdown");
const launchVideo = document.querySelector("#launch-video");
const introModal = document.querySelector("#intro-video-modal");
const introPlayer = document.querySelector("#intro-video-player");
const introSeenKey = "duedoh_intro_video_seen_v1";

if (introModal && introPlayer) {
  let hasSeenIntro = false;
  try {
    hasSeenIntro = window.localStorage.getItem(introSeenKey) === "1";
  } catch (_) {
    // Storage can be unavailable in strict privacy mode; the intro still works.
  }

  const closeIntro = () => {
    introPlayer.pause();
    introModal.hidden = true;
    document.body.classList.remove("intro-video-open");
  };

  if (!hasSeenIntro) {
    introModal.hidden = false;
    document.body.classList.add("intro-video-open");
    try {
      window.localStorage.setItem(introSeenKey, "1");
    } catch (_) {}
    introPlayer.play().catch(() => {
      // Some browsers require a tap even for muted media; controls remain visible.
    });
  }

  introModal.querySelectorAll("[data-intro-close]").forEach((control) => {
    control.addEventListener("click", closeIntro);
  });
  introPlayer.addEventListener("ended", closeIntro);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !introModal.hidden) closeIntro();
  });
}

if (launchVideo) {
  fetch("https://api.duedoh.com/v1/home/launch")
    .then((response) => response.ok ? response.json() : null)
    .then((details) => {
      if (!details?.video_url) return;
      const url = new URL(details.video_url, "https://api.duedoh.com");
      if (url.protocol !== "https:") return;
      launchVideo.src = url.href;
      launchVideo.hidden = false;
    })
    .catch(() => {});
}
if (countdown) {
  // Midnight in India on launch day; an explicit offset keeps every visitor's
  // countdown anchored to the same instant regardless of device timezone.
  const launchAt = Date.parse("2026-11-29T00:00:00+05:30");
  const updateCountdown = () => {
    const remaining = Math.max(0, launchAt - Date.now());
    if (!remaining) {
      countdown.textContent = "Launch day is here!";
      return;
    }
    const days = Math.floor(remaining / 86400000);
    const hours = Math.floor((remaining % 86400000) / 3600000);
    const minutes = Math.floor((remaining % 3600000) / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    countdown.textContent = `${days} days · ${hours} hours · ${minutes} minutes · ${seconds} seconds`;
  };
  updateCountdown();
  window.setInterval(updateCountdown, 1000);
}

if (toggle) {
  toggle.addEventListener("click", () => {
    const isOpen = document.body.classList.toggle("nav-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
}

if (nav) {
  nav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      document.body.classList.remove("nav-open");
      toggle?.setAttribute("aria-expanded", "false");
    }
  });
}

const revealElements = document.querySelectorAll(".reveal");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14, rootMargin: "0px 0px -40px 0px" }
);

revealElements.forEach((element, index) => {
  element.style.setProperty("--reveal-delay", `${Math.min((index % 6) * 70, 350)}ms`);
  observer.observe(element);
});

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      navLinks.forEach((link) => {
        link.classList.toggle("is-current", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  },
  { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
);

sections.forEach((section) => sectionObserver.observe(section));

services.forEach((service) => {
  service.addEventListener("mouseenter", () => {
    services.forEach((item) => item.classList.remove("is-active"));
    service.classList.add("is-active");
  });
});

const updateScrollProgress = () => {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
  document.body.style.setProperty("--progress", `${Math.min(progress, 100)}%`);
};

updateScrollProgress();
window.addEventListener("scroll", updateScrollProgress, { passive: true });

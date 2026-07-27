import fs from "fs";

const raw = fs.readFileSync("src/hooks/site-effects.raw.js", "utf8");

const body = raw
  .replace(
    /document\.addEventListener\('DOMContentLoaded', \(\) => \{[\s\S]*$/,
    ""
  )
  .trim();

const resetNavigationUiFn = `
/** Reset overlay + reveal state after back/forward navigation */
export function resetNavigationUi(): void {
  const pageTransition = document.getElementById("pageTransition");
  if (pageTransition) {
    pageTransition.classList.remove("active");
    pageTransition.style.transform = "translateY(100%)";
  }

  const revealSelectors =
    ".reveal-up, .reveal-left, .reveal-right, .scale-in, .rotate-in, .blur-in, .clip-reveal, .stagger-item";
  document.querySelectorAll(revealSelectors).forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      el.classList.add("active");
    }
  });
}
`;

const output = `// @ts-nocheck
"use client";

import Swiper from "swiper";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
${resetNavigationUiFn}

export function initSiteEffects(): () => void {
${body
  .split("\n")
  .map((line) => "  " + line)
  .join("\n")
  .replace(
    /\/\/ Initialize Hero Swiper[\s\S]*?\/\/ Custom Cursor/,
    `// Initialize Hero Swiper
    function initHeroSwiper() {
      new Swiper(".hero-swiper", {
        modules: [Autoplay, Pagination],
        slidesPerView: 1,
        spaceBetween: 30,
        loop: true,
        autoplay: {
          delay: 3000,
          disableOnInteraction: false,
        },
        pagination: {
          el: ".hero-swiper-pagination",
          clickable: true,
        },
        breakpoints: {
          640: { slidesPerView: 1 },
          768: { slidesPerView: 1 },
          1024: { slidesPerView: 1 },
        },
      });
    }

    // Custom Cursor`
  )
  .replace(
    /\/\/ Contact Form[\s\S]*?\/\/ Initialize everything when DOM is loaded/,
    `// Contact Form
    function initContactForm() {
      if (!contactForm) return;
      contactForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(contactForm);
        const payload = Object.fromEntries(formData.entries());
        try {
          const res = await fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error("Failed");
          alert("Thank you for your message! We will get back to you soon.");
          contactForm.reset();
        } catch {
          alert("Something went wrong. Please try again or email us directly.");
        }
      });
    }

    // Initialize everything when DOM is loaded`
  )}

  const safeInit = (name: string, fn: () => void) => {
    try {
      fn();
    } catch (err) {
      // Avoid one missing element breaking the whole page
      console.warn(\`[kaana] \${name} init failed\`, err);
    }
  };

  safeInit("grid lines", initGridLines);
  safeInit("particles", initParticles);
  safeInit("neural network", initNeuralNetwork);
  safeInit("hero swiper", initHeroSwiper);
  safeInit("custom cursor", initCustomCursor);
  safeInit("scroll progress", initScrollProgress);
  safeInit("reveal on scroll", initRevealOnScroll);
  safeInit("mobile menu", initMobileMenu);
  safeInit("careers modal", initCareersModal);
  safeInit("testimonial slider", initTestimonialSlider);
  safeInit("process timeline", initProcessTimeline);
  safeInit("magnetic buttons", initMagneticButtons);
  safeInit("link click animation", initLinkClickAnimation);
  safeInit("navigation recovery", initNavigationRecovery);
  safeInit("AI chat widget", initAiChatWidget);
  safeInit("AI text generator", initAiTextGenerator);
  safeInit("demo chat", initDemoChat);
  safeInit("AI typing animation", initAiTypingAnimation);
  safeInit("back to top", initBackToTop);
  safeInit("contact form", initContactForm);

  return () => {
    window.removeEventListener("pageshow", resetNavigationUi);
  };
}
`;

fs.writeFileSync("src/lib/initSiteEffects.ts", output);
console.log("Built initSiteEffects.ts");

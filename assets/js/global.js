// Theme management with system preference support
const getStoredTheme = () => {
  try {
    return localStorage.getItem("theme");
  } catch (e) {
    return null;
  }
};
const getSystemTheme = () =>
  window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";

const applyTheme = (theme) => {
  document.documentElement.className = theme;
};

window.setTheme = (theme) => {
  applyTheme(theme);
  try {
    localStorage.setItem("theme", theme);
  } catch (e) {
    // localStorage may be disabled
  }
};

// Listen for system theme changes (only if no stored preference)
// Note: Initial theme is applied by inline script in colorScheme.html to prevent flash
if (window.matchMedia) {
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      if (!getStoredTheme()) {
        applyTheme(e.matches ? "dark" : "light");
      }
    });
}

// Table of Contents Accordion Enhancement
document.addEventListener("DOMContentLoaded", () => {
  const tocAccordion = document.querySelector(".toc-accordion");

  if (tocAccordion) {
    // Add smooth scrolling to ToC links
    const tocLinks = tocAccordion.querySelectorAll("a");
    tocLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        const href = link.getAttribute("href");
        if (href && href.startsWith("#")) {
          e.preventDefault();
          const targetId = href.substring(1);
          const targetElement = document.getElementById(targetId);

          if (targetElement) {
            targetElement.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
            // Update URL without jumping
            history.pushState(null, null, href);
          }
        }
      });
    });

    // Save accordion state to localStorage
    tocAccordion.addEventListener("toggle", () => {
      try {
        localStorage.setItem("tocOpen", tocAccordion.open);
      } catch (e) {
        // localStorage may be disabled
      }
    });

    // Restore accordion state from localStorage
    try {
      const savedState = localStorage.getItem("tocOpen");
      if (savedState !== null) {
        tocAccordion.open = savedState === "true";
      }
    } catch (e) {
      // localStorage may be disabled
    }
  }
});

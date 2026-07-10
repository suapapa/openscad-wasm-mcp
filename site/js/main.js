import { detectLang, setLang, t, getLang } from "./i18n.js";

document.documentElement.classList.add("js");

const initialLang = detectLang();
setLang(initialLang);

const langSelect = document.getElementById("lang-select");
if (langSelect) {
  langSelect.value = getLang();
  langSelect.addEventListener("change", () => {
    setLang(langSelect.value);
  });
}

const copyBtn = document.getElementById("copy-cmd");
const composeCmd = document.getElementById("compose-cmd");
const copyStatus = document.getElementById("copy-status");

if (copyBtn && composeCmd) {
  copyBtn.addEventListener("click", async () => {
    const text = composeCmd.textContent?.trim() ?? "";
    const lang = getLang();
    const copied = t(lang, "start.copied");
    try {
      await navigator.clipboard.writeText(text);
      copyBtn.textContent = copied;
      if (copyStatus) copyStatus.textContent = copied;
      window.setTimeout(() => {
        copyBtn.textContent = t(getLang(), "start.copy");
        if (copyStatus) copyStatus.textContent = "";
      }, 1600);
    } catch {
      const range = document.createRange();
      range.selectNodeContents(composeCmd);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      if (copyStatus) copyStatus.textContent = t(lang, "start.copy.fallback");
    }
  });
}

const revealEls = document.querySelectorAll(".shot, .why-item");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.16, rootMargin: "0px 0px -6% 0px" },
  );
  revealEls.forEach((el) => observer.observe(el));
  window.setTimeout(() => {
    revealEls.forEach((el) => el.classList.add("is-in"));
  }, 2500);
} else {
  revealEls.forEach((el) => el.classList.add("is-in"));
}

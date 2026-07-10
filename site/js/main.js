import { detectLang, setLang, t, getLang } from "./i18n.js";

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

if (copyBtn && composeCmd) {
  copyBtn.addEventListener("click", async () => {
    const text = composeCmd.textContent?.trim() ?? "";
    const lang = getLang();
    try {
      await navigator.clipboard.writeText(text);
      copyBtn.textContent = t(lang, "start.copied");
      window.setTimeout(() => {
        copyBtn.textContent = t(getLang(), "start.copy");
      }, 1600);
    } catch {
      const range = document.createRange();
      range.selectNodeContents(composeCmd);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  });
}

const shots = document.querySelectorAll(".shot");
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
    { threshold: 0.18, rootMargin: "0px 0px -8% 0px" },
  );
  shots.forEach((shot) => observer.observe(shot));
} else {
  shots.forEach((shot) => shot.classList.add("is-in"));
}

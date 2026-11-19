/* Site officiel d’Eduo : navigation, animations au défilement, iPhone 3D, scènes des fonctionnalités,
   carrousel de l’expérience et FAQ. Aucune dépendance. Tout reste lisible sans JavaScript. */

// Réseaux sociaux : ajoute l’adresse de chaque compte quand il existe (les liens vides ne sont pas affichés).
const SOCIAL = {
  tiktok: "",      // ex. "https://www.tiktok.com/@eduo.app"
  instagram: "",   // ex. "https://www.instagram.com/eduo.app"
  youtube: "",     // ex. "https://www.youtube.com/@eduo"
};

(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const desktop = matchMedia("(min-width: 1024px)");
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));

  /* ---------- Navigation ---------- */
  const nav = $(".nav"), toggle = $(".nav__toggle");
  const setMenu = (open) => {
    nav.dataset.open = String(open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
  };
  toggle.addEventListener("click", () => setMenu(nav.dataset.open !== "true"));
  $$(".nav__sheet a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && nav.dataset.open === "true") { setMenu(false); toggle.focus(); } });

  // Le menu se cache quand on descend, revient quand on remonte
  let lastY = scrollY, goingDown = false;
  const dock = $("#dock"), hero = $("#accueil"), finale = $("#telecharger");
  const onScroll = () => {
    const y = scrollY;
    if (y > lastY + 4) goingDown = true;
    else if (y < lastY - 4) goingDown = false;
    if (nav.dataset.open !== "true") nav.classList.toggle("is-hidden", y > 400 && goingDown);
    if (y < 400) nav.classList.remove("is-hidden");
    lastY = y;
    // Bouton collant (mobile) : après l’accueil et avant la section finale, quand on remonte
    // (il se range pendant la lecture, vers le bas, pour ne jamais cacher le texte)
    const pastHero = hero.getBoundingClientRect().bottom < 80;
    const atEnd = finale.getBoundingClientRect().top < innerHeight * 0.9;
    dock.classList.toggle("is-visible", pastHero && !atEnd && !goingDown);
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Lien actif selon la section affichée
  const sections = ["accueil", "fonctionnalites", "comment-ca-marche", "histoire", "faq"].map((id) => document.getElementById(id));
  const activeIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      $$("[data-nav]").forEach((a) => a.classList.toggle("is-active", a.dataset.nav === e.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach((s) => s && activeIO.observe(s));

  /* ---------- Apparitions au défilement ---------- */
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); revealIO.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });
  $$(".reveal").forEach((el) => revealIO.observe(el));

  /* ---------- Accueil : entrée, iPhone 3D, profondeur ---------- */
  const heroPhone = $("#heroPhone"), heroStage = $(".hero__stage");
  const start = () => requestAnimationFrame(() => hero.classList.add("is-ready"));
  const firstImg = $("img", heroPhone);
  if (firstImg.complete) start(); else { firstImg.addEventListener("load", start, { once: true }); setTimeout(start, 1200); }

  let px = 0, py = 0, tx = 0, ty = 0, raf = 0;
  const heroLoop = () => {
    tx += (px - tx) * 0.08; ty += (py - ty) * 0.08;
    const s = clamp(scrollY / innerHeight);
    const t = performance.now() / 1000;
    const ry = -16 + tx * 14 + s * 24, rx = 8 - ty * 10 + s * 6;
    heroPhone.style.transform = `translateY(${(Math.sin(t * 1.1) * 8 - s * 40).toFixed(1)}px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) rotateZ(${(-3 + tx * 2).toFixed(2)}deg)`;
    $$(".chip-card", heroStage).forEach((c) => {
      const d = Number(c.dataset.depth || 0) / 100;
      c.style.transform = `translate3d(${(tx * 26 * d).toFixed(1)}px, ${(ty * 20 * d - s * 120 * d).toFixed(1)}px, 0)`;
    });
    raf = requestAnimationFrame(heroLoop);
  };
  const heroIO = new IntersectionObserver(([e]) => {
    cancelAnimationFrame(raf);
    if (e.isIntersecting && !reduce.matches) raf = requestAnimationFrame(heroLoop);
  });
  heroIO.observe(hero);
  if (reduce.matches) heroPhone.style.transform = "rotateX(6deg) rotateY(-14deg) rotateZ(-3deg)";
  addEventListener("pointermove", (e) => {
    if (!finePointer.matches) return;
    px = e.clientX / innerWidth - 0.5; py = e.clientY / innerHeight - 0.5;
  }, { passive: true });

  /* ---------- Fonctionnalités : scène collante sur grand écran ---------- */
  const host = $(".scene-host");
  const scenes = $$(".feature__visual .scene");
  const homes = scenes.map((s) => s.parentElement);
  let stageMode = false;
  const placeScenes = () => {
    const wanted = desktop.matches;
    if (wanted === stageMode) return;
    stageMode = wanted;
    scenes.forEach((s, i) => (wanted ? host : homes[i]).appendChild(s));
    if (wanted) setScene(0);
    else scenes.forEach((s) => s.classList.remove("is-active"));
  };
  const setScene = (i) => scenes.forEach((s, k) => s.classList.toggle("is-active", k === i));
  const featureIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting && stageMode) setScene(Number(e.target.dataset.feature)); });
  }, { rootMargin: "-45% 0px -45% 0px" });
  $$(".feature").forEach((f) => featureIO.observe(f));
  placeScenes();
  desktop.addEventListener("change", placeScenes);

  // Cartes qui réagissent à la souris (ordinateur)
  const tiltables = $$(".scene .chip-card, .scene .avatar, .step__visual");
  tiltables.forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      if (!finePointer.matches || reduce.matches) return;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(700px) rotateY(${(x * 12).toFixed(2)}deg) rotateX(${(-y * 12).toFixed(2)}deg) scale(1.03)`;
    });
    el.addEventListener("pointerleave", () => { el.style.transform = ""; });
  });

  /* ---------- Étapes : la ligne se remplit au défilement ---------- */
  const track = $(".steps__track"), line = $(".steps__line span");
  const stepsProgress = () => {
    const r = track.getBoundingClientRect();
    const p = clamp((innerHeight * 0.75 - r.top) / (r.height * 0.9));
    line.style.setProperty("--p", reduce.matches ? 1 : p.toFixed(3));
  };
  addEventListener("scroll", stepsProgress, { passive: true });
  stepsProgress();

  /* ---------- Expérience : carrousel 3D piloté par le défilement ---------- */
  const exp = $("#experience"), items = $$(".carousel__item");
  const title = $("#carouselTitle"), text = $("#carouselText"), dots = $$(".carousel__dots i");
  const n = items.length, step = 360 / n;
  let shown = -1;
  const layoutCarousel = () => {
    const w = $(".phone", items[0]).offsetWidth || 220;
    const radius = Math.max(320, (w * 1.75) / (2 * Math.tan(Math.PI / n)));
    const r = exp.getBoundingClientRect();
    const p = clamp(-r.top / (r.height - innerHeight));
    const angle = reduce.matches ? 0 : p * step * (n - 1);
    items.forEach((it, i) => {
      const a = i * step - angle;
      const facing = Math.cos((a * Math.PI) / 180);
      // Chaque téléphone est placé sur le cercle directement (aucune 3D imbriquée) ; les plus proches passent devant
      it.style.transform = `translateZ(${(-radius).toFixed(0)}px) rotateY(${a.toFixed(2)}deg) translateZ(${radius.toFixed(0)}px)`;
      it.style.zIndex = String(Math.round(facing * 100) + 100);
      // Seuls les écrans de face et voisins restent visibles ; ceux de derrière s’effacent
      it.style.opacity = clamp((facing - 0.2) * 1.4, 0, 1).toFixed(2);
      it.style.visibility = facing < 0.2 ? "hidden" : "visible";
      it.style.filter = facing > 0.95 ? "none" : `blur(${((1 - facing) * 3).toFixed(1)}px)`;
    });
    const front = ((Math.round(angle / step) % n) + n) % n;
    if (front !== shown) {
      shown = front;
      title.textContent = items[front].dataset.title;
      text.textContent = items[front].dataset.text;
      dots.forEach((d, i) => d.classList.toggle("is-on", i === front));
    }
  };
  let expTick = false;
  addEventListener("scroll", () => { if (!expTick) { expTick = true; requestAnimationFrame(() => { layoutCarousel(); expTick = false; }); } }, { passive: true });
  addEventListener("resize", layoutCarousel);
  layoutCarousel();

  /* ---------- FAQ : ouverture et fermeture animées ---------- */
  $$(".qa").forEach((qa) => {
    const summary = $("summary", qa), body = $(".qa__body", qa);
    summary.addEventListener("click", (e) => {
      if (reduce.matches) return;
      e.preventDefault();
      if (qa.dataset.busy) return;
      qa.dataset.busy = "1";
      const opening = !qa.open;
      if (opening) qa.open = true;
      const h = body.scrollHeight;
      const anim = body.animate(
        [{ height: opening ? "0px" : `${h}px`, opacity: opening ? 0 : 1 }, { height: opening ? `${h}px` : "0px", opacity: opening ? 1 : 0 }],
        { duration: 420, easing: "cubic-bezier(.22,1,.36,1)" });
      anim.onfinish = () => { if (!opening) qa.open = false; delete qa.dataset.busy; };
    });
  });

  /* ---------- Réseaux sociaux ---------- */
  const ICON = {
    tiktok: '<path d="M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.7a5.7 5.7 0 1 0 4.9 5.7V9.1a7.4 7.4 0 0 0 4.3 1.4V7.4a4.3 4.3 0 0 1-3.2-1.6Z"/>',
    instagram: '<path d="M12 7.3a4.7 4.7 0 1 0 0 9.4 4.7 4.7 0 0 0 0-9.4Zm0 7.7a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm6-7.9a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0ZM21 8.1c-.1-1.6-.4-3-1.6-4.2-1.2-1.2-2.6-1.5-4.2-1.6H8.8c-1.6.1-3 .4-4.2 1.6C3.4 5.1 3.1 6.5 3 8.1v7.8c.1 1.6.4 3 1.6 4.2 1.2 1.2 2.6 1.5 4.2 1.6h6.4c1.6-.1 3-.4 4.2-1.6 1.2-1.2 1.5-2.6 1.6-4.2Z"/>',
    youtube: '<path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4a2.5 2.5 0 0 0-1.8 1.8C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8ZM10 15V9l5.2 3Z"/>',
  };
  const NAMES = { tiktok: "TikTok", instagram: "Instagram", youtube: "YouTube" };
  const box = $("#socials");
  const links = Object.entries(SOCIAL).filter(([, url]) => url);
  if (links.length) {
    box.innerHTML = links.map(([k, url]) => `<a href="${url}" aria-label="Eduo sur ${NAMES[k]}"><svg viewBox="0 0 24 24" aria-hidden="true">${ICON[k]}</svg></a>`).join("");
    box.hidden = false;
  }
})();

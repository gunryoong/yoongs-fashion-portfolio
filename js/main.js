/* ============================================
   렌더링 + 슬라이드쇼 + 홈 미리보기
   ============================================ */

const pad2 = (n) => String(n).padStart(2, "0");
const awardOf = (id) => AWARDS.find((a) => a.id === id);

/* ---------- 카테고리 페이지 ---------- */
const list = document.querySelector("[data-cat]");
if (list) {
  const items = PROJECTS[list.dataset.cat] || [];

  const index = document.querySelector("[data-index]");
  if (index) {
    index.innerHTML = items.map((p, i) =>
      `<a class="pill" href="#${p.id}">${pad2(i + 1)} ${p.sub ? p.title + " — " + p.sub : p.title}</a>`).join("");
  }

  list.innerHTML = items.map((p, i) => {
    const award = awardOf(p.id);
    const tags = [
      award ? `<span class="award">${award.year} ${award.rank}</span>` : "",
      ...(p.tags || []).map((t) => `<span>${t}</span>`),
    ].join("");
    const text = (p.text || []).map((t) => `<p>${t}</p>`).join("");
    const spec = p.spec ? `<ul class="spec">${p.spec.map((s) => `<li>${s}</li>`).join("")}</ul>` : "";
    const awardLine = award ? `<p><b>${award.rank}</b> — ${award.contest}</p>` : "";

    let media = "";
    if (p.video) {
      media = `<div class="film ${p.ratio === "9:16" ? "tall" : ""}">
        <video src="${p.video}" poster="${p.poster}" controls playsinline preload="none"></video></div>`;
    } else if (p.images && p.images.length) {
      media = slidesHTML(p);
    }

    return `<section class="project" id="${p.id}">
      <div class="project-head">
        <h2 class="display rise">${p.title}${p.sub ? `<span class="sub">${p.sub}</span>` : ""}</h2>
        <div class="card rise">
          <p class="k">${pad2(i + 1)} / ${pad2(items.length)}</p>
          <div class="tags">${tags}</div>
          ${awardLine}${text}${spec}
        </div>
      </div>
      ${media}
    </section>`;
  }).join("");

  list.querySelectorAll(".slides").forEach(initSlides);

  // 렌더 뒤에 #주소로 다시 이동
  if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
}

function slidesHTML(p) {
  // pairs: 두 장씩 한 화면 (Before / After)
  const groups = [];
  const step = p.pairs ? 2 : 1;
  for (let i = 0; i < p.images.length; i += step) groups.push(p.images.slice(i, i + step));
  const figs = groups.map((g, i) => `<figure class="${g.length > 1 ? "pair" : ""}${i === 0 ? " on" : ""}">
      ${g.map(([src, w, h]) => `<img ${i < 2 ? "src" : "data-src"}="${src}" width="${w}" height="${h}" alt="${p.title}" ${i === 0 ? "" : 'loading="lazy"'}>`).join("")}
    </figure>`).join("");
  const thumbs = groups.length > 1 ? `<div class="thumbs">${groups.map((g, i) =>
      `<button class="${i === 0 ? "on" : ""}" aria-label="${i + 1}"><img src="${g[0][0]}" loading="lazy" alt=""></button>`).join("")}</div>` : "";
  return `<div class="slides rise" tabindex="0">
      <div class="track">${figs}</div>
      ${groups.length > 1 ? `<button class="hit prev" aria-label="prev"></button><button class="hit next" aria-label="next"></button>
      <span class="count">01 / ${pad2(groups.length)}</span>` : ""}
    </div>${thumbs}`;
}

function initSlides(el) {
  const figs = [...el.querySelectorAll("figure")];
  if (figs.length < 2) return;
  const count = el.querySelector(".count");
  const thumbs = [...(el.nextElementSibling?.classList.contains("thumbs") ? el.nextElementSibling.querySelectorAll("button") : [])];
  let cur = 0;

  const load = (i) => figs[i]?.querySelectorAll("img[data-src]").forEach((img) => {
    img.src = img.dataset.src; img.removeAttribute("data-src");
  });
  const go = (n) => {
    figs[cur].classList.remove("on"); thumbs[cur]?.classList.remove("on");
    cur = (n + figs.length) % figs.length;
    figs[cur].classList.add("on"); thumbs[cur]?.classList.add("on");
    thumbs[cur]?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
    count.textContent = `${pad2(cur + 1)} / ${pad2(figs.length)}`;
    load(cur + 1); load((cur - 1 + figs.length) % figs.length);
  };

  el.querySelector(".prev").addEventListener("click", () => go(cur - 1));
  el.querySelector(".next").addEventListener("click", () => go(cur + 1));
  thumbs.forEach((b, i) => b.addEventListener("click", () => { load(i); go(i); }));
  el.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") go(cur + 1);
    if (e.key === "ArrowLeft") go(cur - 1);
  });

  // 스와이프
  let x0 = null;
  el.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  el.addEventListener("touchend", (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) go(cur + (dx < 0 ? 1 : -1));
    x0 = null;
  });
}

/* ---------- 홈: 수상 목록 ---------- */
const awardList = document.querySelector("[data-awards]");
if (awardList) {
  awardList.innerHTML = AWARDS.map((a) =>
    `<li><span>${a.year}</span><b>${a.rank}</b><a href="ai.html#${a.id}">${a.contest}</a></li>`).join("");
}

/* ---------- 홈: 메뉴 호버 미리보기 ---------- */
const peek = document.querySelector(".peek");
if (peek) {
  const img = peek.querySelector("img");
  document.querySelectorAll("[data-peek]").forEach((a) => {
    a.addEventListener("mouseenter", () => { img.src = a.dataset.peek; peek.classList.add("on"); });
    a.addEventListener("mouseleave", () => peek.classList.remove("on"));
    a.addEventListener("mousemove", (e) => { peek.style.left = e.clientX + "px"; peek.style.top = e.clientY + "px"; });
  });
}

/* ---------- 홈: 겹친 이미지 살짝 따라 움직이기 ---------- */
const floats = document.querySelectorAll(".layer .float");
if (floats.length && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const tick = () => {
    floats.forEach((f) => {
      const r = f.parentElement.getBoundingClientRect();
      const t = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
      f.style.setProperty("--ty", `${Math.max(-1, Math.min(1, t)) * -40}px`);
    });
  };
  addEventListener("scroll", () => requestAnimationFrame(tick), { passive: true });
  tick();
}

/* ---------- 등장 효과 ---------- */
const io = new IntersectionObserver((es) => es.forEach((e) => {
  if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
}), { rootMargin: "0px 0px -8% 0px" });
document.querySelectorAll(".rise").forEach((el) => io.observe(el));

/* ============================================
   렌더링 + 갤러리/라이트박스 + 홈 미리보기
   ============================================ */

const pad2 = (n) => String(n).padStart(2, "0");
const awardOf = (id) => AWARDS.find((a) => a.id === id);
const SHOW = 9; // 처음에 보여줄 사진 수 (나머지는 '더 보기')

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
      media = galleryHTML(p);
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

  list.querySelectorAll(".more").forEach((b) => b.addEventListener("click", () => {
    b.previousElementSibling.classList.remove("folded");
    b.remove();
  }));

  // 렌더 뒤에 #주소로 다시 이동
  if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
}

function galleryHTML(p) {
  // 배열 방식: pairs(전/후 2장씩) · wide(가로 이미지 위주) · 기본(세로 위주, 매거진형 열 배치)
  const wideCount = p.images.filter(([, w, h]) => w > h).length;
  const ratios = p.images.map(([, w, h]) => w / h);
  const mixed = Math.max(...ratios) / Math.min(...ratios) > 1.3;
  const kind = p.pairs ? "pairs" : wideCount > p.images.length / 2 ? (mixed ? "wide mixed" : "wide") : "cols";
  const limit = p.pairs ? 8 : SHOW; // 전/후 쌍이 갈라지지 않게
  const folded = p.images.length > limit + 2;
  const figs = p.images.map(([src, w, h], i) =>
    `<a class="shot${w > h * 1.15 ? " land" : ""}${folded && i >= limit ? " extra" : ""}" href="${src}">
      <img src="${src}" width="${w}" height="${h}" alt="${p.title}" loading="lazy"></a>`).join("");
  return `<div class="gallery ${kind}${folded ? " folded" : ""}" data-title="${p.title}">${figs}</div>
    ${folded ? `<button class="pill more">+ ${p.images.length - limit} 더 보기</button>` : ""}`;
}

/* ---------- 라이트박스 ---------- */
const box = document.createElement("div");
box.className = "box";
box.innerHTML = `<img alt=""><button class="x pill">Close</button>
  <button class="nav prev" aria-label="prev"></button><button class="nav next" aria-label="next"></button>
  <span class="count pill"></span>`;
document.body.appendChild(box);
let shots = [], cur = 0;
const show = (n) => {
  cur = (n + shots.length) % shots.length;
  box.querySelector("img").src = shots[cur].getAttribute("href");
  box.querySelector(".count").textContent = `${pad2(cur + 1)} / ${pad2(shots.length)}`;
};
const close = () => { box.classList.remove("on"); document.body.style.overflow = ""; };
document.addEventListener("click", (e) => {
  const a = e.target.closest(".shot");
  if (!a) return;
  e.preventDefault();
  shots = [...a.parentElement.querySelectorAll(".shot")];
  show(shots.indexOf(a));
  box.classList.add("on");
  document.body.style.overflow = "hidden";
});
box.querySelector(".x").addEventListener("click", close);
box.querySelector(".prev").addEventListener("click", () => show(cur - 1));
box.querySelector(".next").addEventListener("click", () => show(cur + 1));
box.addEventListener("click", (e) => { if (e.target === box) close(); });
document.addEventListener("keydown", (e) => {
  if (!box.classList.contains("on")) return;
  if (e.key === "Escape") close();
  if (e.key === "ArrowRight") show(cur + 1);
  if (e.key === "ArrowLeft") show(cur - 1);
});
let x0 = null;
box.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
box.addEventListener("touchend", (e) => {
  if (x0 === null) return;
  const dx = e.changedTouches[0].clientX - x0;
  if (Math.abs(dx) > 40) show(cur + (dx < 0 ? 1 : -1));
  x0 = null;
});

/* ---------- 수상 목록 ---------- */
document.querySelectorAll("[data-awards]").forEach((ul) => {
  ul.innerHTML = AWARDS.map((a) =>
    `<li><span>${a.year}</span><b>${a.rank}</b><a href="ai.html#${a.id}">${a.contest}</a></li>`).join("");
});

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

/* ---------- 등장 효과 ---------- */
const io = new IntersectionObserver((es) => es.forEach((e) => {
  if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
}), { rootMargin: "0px 0px -8% 0px" });
document.querySelectorAll(".rise").forEach((el) => io.observe(el));

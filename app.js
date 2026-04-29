// Random-clip player. Plays an endless shuffle from clips.json.
// Re-shuffles whenever it exhausts the list so adjacent repeats are minimized.

const player = document.getElementById("player");
const filterEl = document.getElementById("filter");
const nextBtn = document.getElementById("next");
const muteBtn = document.getElementById("mute");

let allClips = [];
let queue = [];
let currentFilm = "";

function shuffle(arr) {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function refillQueue() {
  const pool = currentFilm
    ? allClips.filter(c => c.film === currentFilm)
    : allClips;
  queue = shuffle(pool);
}

function next() {
  if (queue.length === 0) refillQueue();
  if (queue.length === 0) return;
  const c = queue.shift();
  player.src = c.src;
  player.play().catch(() => { /* autoplay restrictions handled by mute */ });
}

function populateFilter() {
  const films = Array.from(new Set(allClips.map(c => c.film))).sort();
  for (const f of films) {
    const opt = document.createElement("option");
    opt.value = f;
    opt.textContent = f;
    filterEl.appendChild(opt);
  }
}

filterEl.addEventListener("change", () => {
  currentFilm = filterEl.value;
  refillQueue();
  next();
});

nextBtn.addEventListener("click", next);
player.addEventListener("ended", next);
player.addEventListener("error", next);

muteBtn.addEventListener("click", () => {
  player.muted = !player.muted;
  muteBtn.textContent = player.muted ? "unmute" : "mute";
});

(async function start() {
  try {
    const res = await fetch("clips.json", { cache: "no-cache" });
    const manifest = await res.json();
    allClips = manifest.clips || [];
    if (allClips.length === 0) return;
    populateFilter();
    refillQueue();
    next();
  } catch (e) {
    console.error("failed to load clips.json", e);
  }
})();

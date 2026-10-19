// Program başına bağlantı önizleme görseli (1200×630): public/img/og/<slug>.png
// Kullanım: node tools/og_images.mjs   (google-chrome gerekir; Poppins Google Fonts'tan yüklenir)
// Görseller depoya işlenir; sunucu dosya varsa og:image olarak kullanır, yoksa img/og.jpg'ye düşer.
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import os from "node:os";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public");
const OUT = path.join(ROOT, "img", "og");
const CHROME = process.env.CHROME || "google-chrome";

const ctx = vm.createContext({});
ctx.window = ctx;
vm.runInContext(fs.readFileSync(path.join(ROOT, "data.js"), "utf8"), ctx, { filename: "data.js" });
const A = ctx.ACADEMIA;
const groupLabel = Object.fromEntries(A.groups.map((g) => [g.id, g.label]));
const programs = A.programs.filter((p) => p.active !== false && !p.soon && (process.argv.length < 3 || process.argv.includes(p.slug)));

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const nut = fs.readFileSync(path.join(ROOT, "index.html"), "utf8").match(/<svg class="nut"[\s\S]*?<\/svg>/)[0].replace(/width="48" height="48"/, 'width="64" height="64"');

const page = (p) => `<!doctype html><html lang="tr"><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;800&display=block">
<style>
  :root { --shell:#7a4426; --shell-dark:#5a2f19; --kernel:#f6e3bf; --kernel-dark:#e8c98e; --leaf:#3f7d3a; --leaf-dark:#2b5c28; }
  * { margin:0; box-sizing:border-box; }
  html, body { width:1200px; height:630px; overflow:hidden; }
  body { font-family:Poppins, sans-serif; color:#fbf5ee; padding:72px 90px; display:flex; flex-direction:column;
    background: radial-gradient(520px 420px at 1040px 150px, rgba(160,96,52,.38), transparent 70%), #2a1a12; }
  .nut-shell { fill:var(--shell); } .nut-shell-dark { fill:var(--shell-dark); } .nut-kernel { fill:var(--kernel); } .nut-kernel-dark { fill:var(--kernel-dark); }
  .nut-crack { fill:none; stroke:var(--shell-dark); stroke-width:2; stroke-linejoin:round; stroke-linecap:round; }
  .nut-leaf { fill:var(--leaf); } .nut-leaf-rib { fill:none; stroke:var(--leaf-dark); stroke-width:1.2; }
  .brand { display:flex; align-items:center; gap:16px; font-weight:800; font-size:40px; letter-spacing:-.5px; }
  .brand .m { color:#e0aa76; }
  .eyebrow { margin-top:auto; font-weight:600; font-size:24px; color:#e0aa76; letter-spacing:.5px; text-transform:uppercase; }
  h1 { font-weight:800; font-size:${p.title.length > 22 ? 64 : 80}px; line-height:1.08; letter-spacing:-1px; margin-top:10px; }
  p { margin-top:22px; font-weight:500; font-size:28px; color:#d2c2b2; }
  .bar { position:absolute; left:0; right:0; bottom:0; height:12px; background:linear-gradient(90deg, #7a4426, #e0aa76); }
</style>
<body>
  <div class="brand">${nut}<span><span class="m">M</span>academia</span></div>
  <div class="eyebrow">${esc(groupLabel[p.group] || "")}</div>
  <h1>${esc(p.title)}</h1>
  <p>${esc(p.fact)}</p>
  <div class="bar"></div>
</body></html>`;

fs.mkdirSync(OUT, { recursive: true });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "og-"));
for (const p of programs) {
  const html = path.join(tmp, `${p.slug}.html`), png = path.join(OUT, `${p.slug}.png`);
  fs.writeFileSync(html, page(p));
  execFileSync(CHROME, ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1", "--window-size=1200,630",
    "--virtual-time-budget=5000", `--user-data-dir=${path.join(tmp, "profile")}`, `--screenshot=${png}`, `file://${html}`], { stdio: ["ignore", "pipe", "pipe"] });
  console.log(path.relative(process.cwd(), png));
}
fs.rmSync(tmp, { recursive: true, force: true });

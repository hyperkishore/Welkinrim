# WelkinRim Project Instructions

## Project Overview
WelkinRim is a **real** drone motor manufacturer company. Static HTML/CSS/JS site (no framework). Served locally at `localhost:8765`.

**Current version:** 1.2.41
**Repo:** https://github.com/hyperkishore/Welkinrim.git
**Live site:** https://hyperkishore.github.io/Welkinrim/
**Branch:** main

---

## Browser Automation

**IMPORTANT:** Always use `mcp__claude-in-chrome__*` tools for ALL browser automation (screenshots, page interaction, testing). NEVER use `mcp__playwright__*` tools. Claude in Chrome connects to the user's actual Chrome browser with logged-in sessions and cookies, which is the preferred workflow.

---

## Site Structure

### Pages
- `index.html` — Homepage (hero, solutions, case studies, testimonials, motor finder, comparison, FAQ, RFQ form)
- `blog.html` — Engineering blog
- `case-studies.html` — Customer case studies
- `about.html` — Company page
- `motor-matchmaker.html` — Interactive motor selection tool
- `configurator.html` — Advanced motor configurator
- `products.html` — Products overview
- `products/commercial-motors.html` — Commercial motors with WR2212/WR2815/WR3508 detail views
- `products/micro-motors.html`, `products/industrial-motors.html`, `products/propulsion-systems.html`
- `applications/defence.html`, `applications/agriculture.html`
- `tools/calculator.html` — Performance calculator
- `asset-library.html` — **Internal reference page** (not linked from nav, see below)

### Key Files
- `styles.css` — Main stylesheet
- `scripts.js` — Main JS
- `motor-database.js` — Motor specs data
- `VERSION` — Current version number
- `.env` — API keys (gitignored, NEVER commit)
- `DESIGN-TOOLS.md` — Complete catalog of 110+ design MCP servers/skills/plugins

---

## API Keys & Secrets

All API keys live in `.env` (gitignored). **NEVER hardcode keys in source files or commit them.**

```bash
# .env contents:
GOOGLE_API_KEY=...    # Google Gemini / Nano Banana image gen (free tier: 500 img/day)
HF_TOKEN=...          # HuggingFace Inference API (FLUX.1 Schnell)
# OPENAI_API_KEY=...  # OpenAI GPT Image 1.5 (not yet set up)
# REPLICATE_API_TOKEN=... # Replicate FLUX.2 Pro (not yet set up)
```

**To load keys in shell scripts:**
```bash
source /Users/kishore/Desktop/Claude-experiments/welkinrim/.env
curl -H "Authorization: Bearer $HF_TOKEN" ...
```

**MCP servers read keys via env vars** — configured at install time, not from `.env` directly.

---

## Image Generation Pipeline

### Goal
Replace all placeholder SVG/PNG motor assets with **photorealistic 3D product renders** matching professional motor manufacturer catalogs (MAD Motors, LIG Power, T-Motor, Hobbywing).

### Reference Style
- **Primary reference:** Hobbywing XRotor M4006 — open bell design with triangular cutouts, copper windings visible through slots, black anodized aluminum, bold white branding, floor reflection, dramatic edge lighting
- **Other references:** `assets/36d2a06500.jpg` (MAD 4014), LIG Power product photography

### Models Available (best to worst for our use case)

| Model | Access Method | Quality | Text Rendering | Status |
|-------|-------------|---------|----------------|--------|
| **Nano Banana Pro** (Google Gemini) | `imagegen` MCP / Google AI API | Excellent | Good | Ready (free tier) |
| **GPT Image 1.5** (OpenAI) | `imagegen` MCP / OpenAI API | Excellent | Best | Need `OPENAI_API_KEY` |
| **FLUX.2 Pro** (Black Forest Labs) | `imagegen` MCP / Replicate API | Excellent | OK | Need `REPLICATE_API_TOKEN` |
| **FLUX.1 Schnell** (Black Forest Labs) | HF Inference API (curl) | Good | Poor | Ready (HF_TOKEN) |

### How to Get Missing API Keys

**OpenAI (GPT Image 1.5):**
1. Go to https://platform.openai.com/api-keys
2. Create new secret key
3. Add billing at https://platform.openai.com/settings/organization/billing
4. Add to `.env` as `OPENAI_API_KEY=sk-...`
5. Reinstall imagegen MCP with: `claude mcp add-json imagegen '{"command":"npx","args":["-y","@fastmcp-me/imagegen-mcp"],"env":{"GOOGLE_API_KEY":"...","OPENAI_API_KEY":"sk-..."}}'`

**Replicate (FLUX.2 Pro):**
1. Go to https://replicate.com/account/api-tokens
2. Create token
3. Add to `.env` as `REPLICATE_API_TOKEN=r8_...`
4. Reinstall imagegen MCP with the token added to env

### Direct API Generation (FLUX.1 Schnell via curl)

This works right now without any MCP. Used to generate v3 and v4 assets:

```bash
source .env
curl -s -X POST \
  "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell" \
  -H "Authorization: Bearer $HF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"inputs": "your prompt here"}' \
  --output image.jpg
```

- Returns JPEG directly (~3 seconds per image)
- No GPU quota limits with token (unlike ZeroGPU Spaces)
- Quality: good photorealism but **poor text rendering** (garbles brand names/model numbers)

### Known Limitations of FLUX.1 Schnell
- Text rendering is unreliable: "WelkinRim" → "Welikjm", "WR3508" → "WR308"
- Motor proportions don't always match real outrunner geometry
- Random symbols/characters appear on PCB/stator areas
- All 3 motor models look too similar (not distinct enough)

**Solution:** Use newer models (Nano Banana, GPT Image 1.5) which handle text and fine details much better. Generate without text, then overlay branding via CSS/image editor.

---

## Asset Library & Numbering System

`asset-library.html` is an internal reference page showing all 73 visual assets with numbered IDs. Use these numbers to reference specific assets (e.g., "put #7 in the hero" = wr2212-side.svg).

### Asset Index — Original SVGs (#1-#37)

| # | File | Path | Category |
|---|------|------|----------|
| #1 | hero-motor.svg | assets/hero-motor.svg | Motor Illustrations |
| #2 | micro-motor.svg | assets/micro-motor.svg | Motor Illustrations |
| #3 | commercial-motor.svg | assets/commercial-motor.svg | Motor Illustrations |
| #4 | industrial-motor.svg | assets/industrial-motor.svg | Motor Illustrations |
| #5 | commercial-motors-hero.svg | assets/commercial-motors-hero.svg | Motor Illustrations |
| #6 | wr2212-motor.svg | assets/wr2212-motor.svg | WR2212 Views |
| #7 | wr2212-side.svg | assets/wr2212-side.svg | WR2212 Views |
| #8 | wr2212-back.svg | assets/wr2212-back.svg | WR2212 Views |
| #9 | wr2212-specs.svg | assets/wr2212-specs.svg | WR2212 Views |
| #10 | wr2815-motor.svg | assets/wr2815-motor.svg | WR2815 Views |
| #11 | wr2815-motor-detail.svg | assets/wr2815-motor-detail.svg | WR2815 Views |
| #12 | wr2815-side.svg | assets/wr2815-side.svg | WR2815 Views |
| #13 | wr2815-back.svg | assets/wr2815-back.svg | WR2815 Views |
| #14 | wr2815-specs.svg | assets/wr2815-specs.svg | WR2815 Views |
| #15 | wr3508-motor.svg | assets/wr3508-motor.svg | WR3508 Views |
| #16 | wr3508-side.svg | assets/wr3508-side.svg | WR3508 Views |
| #17 | wr3508-back.svg | assets/wr3508-back.svg | WR3508 Views |
| #18 | wr3508-specs.svg | assets/wr3508-specs.svg | WR3508 Views |
| #19 | wr1806-motor.svg | assets/wr1806-motor.svg | Other Motors (unused) |
| #20 | wr4020-motor.svg | assets/wr4020-motor.svg | Other Motors (unused) |
| #21-#23 | iso-9001.svg, ce-mark.svg, fcc-cert.svg | assets/ | Cert Badges |
| #24-#26 | logo.svg, favicon.svg, Welkinrim logo.png | assets/ | Branding |
| #27-#28 | 36d2a06500.jpg, MADV68VTOLDronebrushlessmotor.webp | assets/ | Photography (unused) |
| #29-#37 | ideaforge.svg through aerovironment.svg | assets/clients/ | Client Logos |

### Generated v2 Assets — CSS Renders (#38-#51)

Created via HTML/CSS 3D rendering + Playwright screenshots. Dark studio backgrounds, CSS gradient metallic surfaces. **Placeholder quality — not production-ready.**

| # | File | Replaces |
|---|------|----------|
| #38-#39 | hero-motor-v2.png, commercial-motors-hero-v2.png | #1, #5 |
| #40-#43 | WR2212 front/side/back/specs v2.png | #6-#9 |
| #44-#47 | WR2815 motor/side/back/specs v2.png | #10, #12-#14 |
| #48-#51 | WR3508 motor/side/back/specs v2.png | #15-#18 |

### Generated v3 Assets — FLUX.1 Schnell AI Renders (#52-#62)

Generated via HuggingFace Inference API (FLUX.1 Schnell). Generic studio product photography style. **Better than v2 but text rendering is poor.**

| # | File | Replaces |
|---|------|----------|
| #52 | hero-motor-v3.jpg | #1 |
| #53 | commercial-motors-hero-v3.jpg | #5 |
| #54-#56 | wr2212 motor/side/back v3.jpg | #6-#8 |
| #57-#59 | wr2815 motor/side/back v3.jpg | #10, #12-#13 |
| #60-#62 | wr3508 motor/side/back v3.jpg | #15-#17 |

### Generated v4 Assets — Hobbywing Style AI Renders (#63-#73)

Generated via FLUX.1 Schnell with Hobbywing XRotor M4006-inspired prompts. Open bell with triangular cutouts, copper windings visible, black anodized aluminum, white studio background. **Best style so far but still has text rendering issues.**

| # | File | Replaces |
|---|------|----------|
| #63 | hero-motor-v4.jpg | #1 |
| #64 | commercial-motors-hero-v4.jpg | #5 |
| #65-#67 | wr2212 motor/side/back v4.jpg | #6-#8 |
| #68-#70 | wr2815 motor/side/back v4.jpg | #10, #12-#13 |
| #71-#73 | wr3508 motor/side/back v4.jpg | #15-#17 |

### Asset Quality Summary

| Version | Method | Pros | Cons | Production Ready? |
|---------|--------|------|------|-------------------|
| v1 (SVG) | Hand-drawn SVGs | Clean, scalable | Flat, not photorealistic | No |
| v2 (PNG) | HTML/CSS + Playwright | 3D-ish look | Dark, plasticky, not realistic | No |
| v3 (JPG) | FLUX.1 Schnell | Photorealistic lighting | Garbled text, generic style | No |
| v4 (JPG) | FLUX.1 Schnell + Hobbywing style | Best style match | Still garbled text, some wrong geometry | No |
| **v5 (planned)** | Nano Banana / GPT Image 1.5 | Latest models, better text | Needs API keys | Pending |

---

## Installed Design Tools

### MCP Servers (14 installed)

**Working:**
- `icons8mcp` — 368,865+ icons across 116 styles
- `iconify` — 275,000+ icons via Iconify API (natural language search)
- `drawio` — Create diagrams in draw.io
- `tailwind` — Tailwind CSS docs + color palette generation
- `playwright` — Cross-browser screenshots + visual testing
- `flowbite` — 60+ Tailwind UI components + AI theme generator
- `huggingface` — HF Spaces for AI image gen (FLUX.1, etc.)
- `imagegen` — **Multi-model image gen** (Nano Banana/Gemini, GPT Image, FLUX via Replicate). Configured with `GOOGLE_API_KEY`. Scope: user-level (all projects).

**Needs Authentication/API Keys:**
- `figma` — Official Figma MCP (needs Figma login at https://mcp.figma.com/mcp)
- `recraft` — High-quality SVG + raster generation (needs RECRAFT_API_TOKEN env var)
- `svgmaker` — AI text-to-SVG generation (needs SVGMAKER_API_KEY env var)

**Failed (need troubleshooting):**
- `sharp` — Image resize/crop/conversion
- `lottiefiles` — Lottie animation search
- `shadcn` — shadcn/ui components

### imagegen MCP — Multi-Model Image Generation

The `imagegen` MCP server (`@fastmcp-me/imagegen-mcp`) is the primary image generation tool. It supports multiple models through a unified interface:

**Currently enabled:**
- Nano Banana (Google Gemini) — via `GOOGLE_API_KEY`

**Can be enabled by adding keys:**
- GPT Image 1 (OpenAI) — needs `OPENAI_API_KEY` added to MCP env
- FLUX 1.1 Pro (via Replicate) — needs `REPLICATE_API_TOKEN` added to MCP env

**To add more keys to the MCP:**
```bash
claude mcp add-json imagegen '{"command":"npx","args":["-y","@fastmcp-me/imagegen-mcp"],"env":{"GOOGLE_API_KEY":"...","OPENAI_API_KEY":"sk-...","REPLICATE_API_TOKEN":"r8_..."}}'
```

### Claude Code Skills (6 design skills installed in `.agents/skills/`)
- `canvas-design` — Museum/magazine quality visual art
- `frontend-design` — Bold design for React + Tailwind (anti-"AI slop")
- `algorithmic-art` — Generative art with p5.js
- `brand-guidelines` — Brand identity creation
- `theme-factory` — Theme/design system generation
- `web-artifacts-builder` — Multi-component HTML artifacts

### Full Tool Catalog — 110+ Tools Identified

Full catalog with install commands is in `DESIGN-TOOLS.md`.

---

## Next Steps

### Immediate: Generate v5 Assets with Modern Models
1. Test Nano Banana (Gemini) via `imagegen` MCP — already configured
2. Get `OPENAI_API_KEY` → enable GPT Image 1.5 (best text rendering)
3. Get `REPLICATE_API_TOKEN` → enable FLUX.2 Pro (best photorealism)
4. Generate v5 motor renders using best model for each view
5. Compare v5 against v4, pick best per-asset
6. Replace website assets with final selections

### Strategy: Mix Models Per Use Case
- **Hero shots** (need "wow" factor): Nano Banana or GPT Image 1.5
- **Product detail views** (need accuracy): GPT Image 1.5 (best at text/logos)
- **Side/back views** (need consistency): FLUX.2 Pro or Nano Banana
- **Text overlays**: Generate clean images WITHOUT text, add branding via CSS

---

## Claude-in-Chrome Troubleshooting

**Chrome Profile:** Always use the **Kishore Natarajan** profile (`Profile 1`). To open Chrome with this profile:
```bash
open -a "Google Chrome" --args --profile-directory="Profile 1"
```

**Setup files (all present and correct):**
- Native host config: `~/Library/Application Support/Google/Chrome/NativeMessagingHosts/com.anthropic.claude_code_browser_extension.json`
- Native host binary: `~/.claude/chrome/chrome-native-host` (shell script → exec Claude Code v2.1.39)
- Claude Code binary: `~/.local/share/claude/versions/2.1.39`
- Extension ID: `fcoeoabgfenejglbffodgkkbkcdhcgfn`

**If extension won't connect:**
1. Fully quit Chrome (Cmd+Q), then reopen
2. Click Claude extension icon in toolbar to activate
3. Ensure logged into claude.ai with same account as Claude Code
4. Check: `~/Library/Application Support/Google/Chrome/NativeMessagingHosts/` should have `com.anthropic.claude_code_browser_extension.json` (NOT `.backup`)
5. The old `com.anthropic.claude_browser_extension.json` should be `.backup` (already done)
6. If still failing, try: restart Claude Code, then restart Chrome

---

## Development Patterns

- **Page pattern:** Self-contained `<style>` blocks for page-specific CSS (see blog.html, asset-library.html)
- **Shared CSS:** `styles.css` for global styles, CSS variables for theming
- **Nav/Footer:** Copy from index.html for consistency; adjust links to use relative paths from page location
- **Dark theme:** Fully dark site since v1.2.24. All sections use `section-dark`. No more `section-light`.
- **Orange accent:** `var(--accent)` = `#f6a604`
- **Fonts:** Plus Jakarta Sans (headings), Inter (body)
- **No build step:** Plain HTML/CSS/JS, no bundler
- **Local server:** `python3 -m http.server 8765`

---

## Hero A/B Testing Panel (removed in v1.2.25)

The homepage previously had a localhost-only A/B variant switcher panel for testing different hero backgrounds. It was removed in v1.2.25 after locking "Workshop Hands" as the production hero.

**To restore for future A/B testing:** Check git history at commit `c951159` (v1.2.24) — the full panel script was at the bottom of `index.html` inside a `location.hostname === 'localhost'` guard. It supported 7 variants:
- Original (clean gradient)
- Subtle Glow (epic motor, screen blend 25%)
- Bold Glow (epic motor, screen blend 30%)
- Workshop Hands (current production — `workshop-hands-v1.png`)
- Lab Tweezers (`workshop-lab-v1.png`)
- Exploded View (`workshop-exploded-v1.png`)
- Gemini Workshop (`workshop-gemini-ref.png`)

**Hero background images** are still in `assets/generated/` and can be reused.

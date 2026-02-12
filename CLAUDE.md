# WelkinRim Project Instructions

## Project Overview
WelkinRim is a **real** drone motor manufacturer company. Static HTML/CSS/JS site (no framework). Served locally at `localhost:8765`.

**Current version:** 1.2.17
**Repo:** https://github.com/hyperkishore/Welkinrim.git
**Live site:** https://hyperkishore.github.io/Welkinrim/
**Branch:** main

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
- `DESIGN-TOOLS.md` — Complete catalog of 110+ design MCP servers/skills/plugins

---

## Asset Library & Numbering System

`asset-library.html` is an internal reference page showing all 37 visual assets with numbered IDs. Use these numbers to reference specific assets (e.g., "put #7 in the hero" = wr2212-side.svg).

### Asset Index

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
| #21 | iso-9001.svg | assets/iso-9001.svg | Cert Badges |
| #22 | ce-mark.svg | assets/ce-mark.svg | Cert Badges |
| #23 | fcc-cert.svg | assets/fcc-cert.svg | Cert Badges |
| #24 | logo.svg | assets/logo.svg | Branding (unused) |
| #25 | favicon.svg | assets/favicon.svg | Branding |
| #26 | Welkinrim logo.png | assets/Welkinrim logo.png | Branding |
| #27 | 36d2a06500.jpg | assets/36d2a06500.jpg | Photography (unused) |
| #28 | MADV68VTOLDronebrushlessmotor.webp | assets/MADV68VTOLDronebrushlessmotor.webp | Photography (unused) |
| #29 | ideaforge.svg | assets/clients/ideaforge.svg | Client Logos |
| #30 | garuda-aerospace.svg | assets/clients/garuda-aerospace.svg | Client Logos |
| #31 | iotechworld.svg | assets/clients/iotechworld.svg | Client Logos |
| #32 | parrot.svg | assets/clients/parrot.svg | Client Logos |
| #33 | thales.svg | assets/clients/thales.svg | Client Logos |
| #34 | wingcopter.svg | assets/clients/wingcopter.svg | Client Logos |
| #35 | skydio.svg | assets/clients/skydio.svg | Client Logos |
| #36 | anduril.svg | assets/clients/anduril.svg | Client Logos |
| #37 | aerovironment.svg | assets/clients/aerovironment.svg | Client Logos |

### Asset Quality Assessment
All 25 SVG motor illustrations, product views, certification badges, and branding assets were redesigned in v1.2.17 with professional metallic gradients, detailed bell housing/stator/copper windings, consistent design language, and transparent backgrounds. Client logos (#29-#37) remain unchanged.

---

## Installed Design Tools

### MCP Servers (13 installed)

**Working:**
- `icons8mcp` — 368,865+ icons across 116 styles
- `iconify` — 275,000+ icons via Iconify API (natural language search)
- `drawio` — Create diagrams in draw.io
- `tailwind` — Tailwind CSS docs + color palette generation
- `playwright` — Cross-browser screenshots + visual testing
- `flowbite` — 60+ Tailwind UI components + AI theme generator
- `huggingface` — HF Spaces for AI image gen (FLUX.1, etc.)

**Needs Authentication/API Keys:**
- `figma` — Official Figma MCP (needs Figma login at https://mcp.figma.com/mcp)
- `recraft` — High-quality SVG + raster generation (needs RECRAFT_API_TOKEN env var)
- `svgmaker` — AI text-to-SVG generation (needs SVGMAKER_API_KEY env var)

**Failed (need troubleshooting):**
- `sharp` — Image resize/crop/conversion
- `lottiefiles` — Lottie animation search
- `shadcn` — shadcn/ui components

### Claude Code Skills (6 design skills installed in `.agents/skills/`)
- `canvas-design` — Museum/magazine quality visual art
- `frontend-design` — Bold design for React + Tailwind (anti-"AI slop")
- `algorithmic-art` — Generative art with p5.js
- `brand-guidelines` — Brand identity creation
- `theme-factory` — Theme/design system generation
- `web-artifacts-builder` — Multi-component HTML artifacts

### Full Tool Catalog — 110+ Tools Identified

We researched and cataloged 110+ design-related MCP servers, skills, and plugins. Only 19 are installed so far (13 MCP servers + 6 skills). The full catalog with install commands is in `DESIGN-TOOLS.md`.

**What's NOT yet installed, by category:**

| Category | Tools Available | Highlights |
|----------|----------------|------------|
| **Figma (additional)** | 7 more | Framelink, figma-developer-mcp, figma-mcp-pro, talk-to-figma, html.to.design |
| **Canva** | 2 | Official Canva AI Connector, Composio Canva MCP |
| **Adobe/Illustrator** | 5 | Unified Adobe MCP (PS+AI+Premiere+InDesign), Illustrator-specific MCPs |
| **SVG Generation** | 3 more | SVG Maker (erkamkavak), EverArt Forge, mcp-svg-to-fonts |
| **Image Generation AI** | 18 | Stability AI (SD3.5), DALL-E 3, Replicate Flux, FAL AI, PiAPI (Midjourney), Gemini, ComfyUI (local), HF Space |
| **Design Systems** | 7 more | 21st.dev Magic, Magic UI, Magic Patterns, daisyUI Blueprint, v0 (Vercel), WebForge |
| **Animation/Motion** | 3 more | Allyson (animate SVGs), GSAP Master, Motion.dev |
| **Color Palette** | 2 | Color Scheme MCP, Colors and Fonts MCP |
| **Image Processing** | 2 more | Cloudinary MCP, MCP Image Optimizer |
| **Stock Images** | 3 | Unsplash Smart, Stock Images (multi-provider), Stocky |
| **Logo/Branding** | 4 | Superdesign, BrandSnap, Logo.dev, Auto Favicon |
| **Diagramming** | 2 more | Excalidraw MCP, Mermaid MCP |
| **Other Design Apps** | 4 | Sketch MCP, Penpot MCP, Framer MCP, Blender MCP (3D) |
| **Additional Skills** | 7+ | ui-ux-pro-max (22K installs), web-design-guidelines (91K installs), tailwind-design-system, visual-design-foundations, interaction-design, baoyu-infographic, baoyu-image-gen |

**To install any of these:** Open `DESIGN-TOOLS.md`, find the tool, copy the install command. Most are one-liners like `claude mcp add name -- npx -y package-name`.

**Key tools to prioritize installing next:**
- `recraft` API key — best-in-class SVG illustration generation
- `svgmaker` API key — text-to-SVG with editing
- Stability AI or DALL-E 3 — for raster image generation
- Additional Figma MCPs — if user has Figma files to work from
- GSAP Master — for adding animations to the site

---

## Next Steps

The user wants to redesign the visual assets. Priorities:
1. Review current asset quality in browser at `localhost:8765/asset-library.html`
2. Use installed design tools (iconify, huggingface, recraft once keyed) to create better motor illustrations
3. Replace low-quality SVGs with professional alternatives
4. Consider getting API keys for recraft and svgmaker for direct SVG generation
5. Install additional tools from `DESIGN-TOOLS.md` as needed (91 more available)

---

## Development Patterns

- **Page pattern:** Self-contained `<style>` blocks for page-specific CSS (see blog.html, asset-library.html)
- **Shared CSS:** `styles.css` for global styles, CSS variables for theming
- **Nav/Footer:** Copy from index.html for consistency; adjust links to use relative paths from page location
- **Dark theme:** `--gradient-hero` for dark sections, alternating `section-dark`/`section-light`
- **Orange accent:** `var(--accent)` = `#f6a604`
- **Fonts:** Plus Jakarta Sans (headings), Inter (body)
- **No build step:** Plain HTML/CSS/JS, no bundler
- **Local server:** `python3 -m http.server 8765`

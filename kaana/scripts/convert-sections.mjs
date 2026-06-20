import fs from "fs";
import path from "path";

const html = fs.readFileSync("legacy/index.html", "utf8");

function htmlToJsx(chunk) {
  return chunk
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\bclass=/g, "className=")
    .replace(/\bfor=/g, "htmlFor=")
    .replace(/\btabindex=/g, "tabIndex=")
    .replace(/\bautoplay\b/g, "autoPlay")
    .replace(/\bplaysinline\b/g, "playsInline")
    .replace(/\breadonly\b/g, "readOnly")
    .replace(/<img([^>]*?)>/gi, "<img$1 />")
    .replace(/<input([^>]*?)>/gi, "<input$1 />")
    .replace(/<br>/gi, "<br />")
    .replace(/<hr>/gi, "<hr />")
    .replace(/<source([^>]*?)>/gi, "<source$1 />")
    .replace(/style="([^"]*)"/g, (_, s) => {
      const obj = s
        .split(";")
        .filter(Boolean)
        .map((p) => {
          const [k, v] = p.split(":").map((x) => x.trim());
          const camel = k.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
          return `${camel}: "${v}"`;
        })
        .join(", ");
      return `style={{ ${obj} }}`;
    });
}

function extract(startMarker, endMarker) {
  const start = html.indexOf(startMarker);
  const end = html.indexOf(endMarker, start);
  if (start === -1 || end === -1) {
    throw new Error(`Missing markers: ${startMarker}`);
  }
  return html.slice(start, end);
}

const sections = {
  Header: extract("<!-- Header -->", "<!-- Mobile Menu -->"),
  MobileMenu: extract("<!-- Mobile Menu -->", "<!-- Careers Modal Overlay -->"),
  CareersModal: extract(
    "<!-- Careers Modal Overlay -->",
    "<!-- Main Content -->"
  ),
  HeroSection: extract("<!-- Hero Section -->", "<!-- Solutions Section -->"),
  SolutionsSection: extract(
    "<!-- Solutions Section -->",
    "<!-- AI Demo Section -->"
  ),
  AiDemoSection: extract(
    "<!-- AI Demo Section -->",
    "<!-- Process Section -->"
  ),
  ProcessSection: extract("<!-- Process Section -->", "<!-- Work Section -->"),
  WorkSection: extract("<!-- Work Section -->", "<!-- About Section -->"),
  AboutSection: extract(
    "<!-- About Section -->",
    "<!-- Testimonials Section -->"
  ),
  TestimonialsSection: extract(
    "<!-- Testimonials Section -->",
    "<!-- Contact Section -->"
  ),
  ContactSection: extract("<!-- Contact Section -->", "  </main>"),
  Footer: extract("<!-- Footer -->", "<!-- Back to Top Button -->"),
  BackToTop: extract("<!-- Back to Top Button -->", "<!-- AI Chat Widget -->"),
  AiChatWidget: extract("<!-- AI Chat Widget -->", "  <script>"),
};

const outDir = "src/components/site";
fs.mkdirSync(outDir, { recursive: true });

for (const [name, content] of Object.entries(sections)) {
  const jsx = htmlToJsx(content.trim());
  const file = `'use client';\n\nexport default function ${name}() {\n  return (\n    <>\n${jsx
    .split("\n")
    .map((l) => "      " + l)
    .join("\n")}\n    </>\n  );\n}\n`;
  fs.writeFileSync(path.join(outDir, `${name}.tsx`), file);
}

const overlays = extract(
  '<body class="bg-dark text-light">',
  "<!-- Header -->"
);
const overlayJsx = htmlToJsx(overlays.trim());
fs.writeFileSync(
  path.join(outDir, "GlobalOverlays.tsx"),
  `'use client';\n\nexport default function GlobalOverlays() {\n  return (\n    <>\n${overlayJsx
    .split("\n")
    .map((l) => "      " + l)
    .join("\n")}\n    </>\n  );\n}\n`
);

console.log("Generated", Object.keys(sections).length + 1, "components");

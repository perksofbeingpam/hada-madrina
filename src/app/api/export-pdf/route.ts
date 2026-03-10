import { NextRequest, NextResponse } from "next/server";
import type { CVOutput } from "@/types";

function buildCVHtml(cv: CVOutput, coverLetter?: string): string {
  const skillsList = cv.core_skills
    .map((s) => `<span class="skill-tag">${s}</span>`)
    .join("");

  const experienceHtml = cv.experience
    .map(
      (exp) => `
    <div class="experience-item">
      <div class="exp-header">
        <div class="exp-left">
          <span class="exp-title">${exp.title}</span>
          <span class="exp-company">${exp.company}${exp.location ? ` · ${exp.location}` : ""}</span>
        </div>
        <span class="exp-dates">${exp.dates}</span>
      </div>
      <ul class="bullets">
        ${exp.bullets.map((b) => `<li>${b}</li>`).join("")}
      </ul>
    </div>
  `
    )
    .join("");

  const educationHtml = cv.education
    .map(
      (edu) => `
    <div class="edu-item">
      <div class="exp-header">
        <div class="exp-left">
          <span class="exp-title">${edu.degree}</span>
          <span class="exp-company">${edu.institution}</span>
        </div>
        <span class="exp-dates">${edu.year}</span>
      </div>
    </div>
  `
    )
    .join("");

  const certificationsHtml =
    cv.certifications.length > 0
      ? `
    <section class="section">
      <h2 class="section-title">Certifications</h2>
      <div class="cert-grid">
        ${cv.certifications.map((c) => `<span class="cert-item">${c}</span>`).join("")}
      </div>
    </section>
  `
      : "";

  const languagesHtml =
    cv.languages.length > 0
      ? `
    <section class="section">
      <h2 class="section-title">Languages</h2>
      <div class="skills-list">${cv.languages.map((l) => `<span class="skill-tag">${l}</span>`).join("")}</div>
    </section>
  `
      : "";

  const coverLetterHtml = coverLetter
    ? `
    <div class="page-break"></div>
    <div class="cover-letter-page">
      <h1 class="cover-letter-title">Cover Letter</h1>
      <div class="cover-letter-body">${coverLetter.split("\n\n").map((p) => `<p>${p}</p>`).join("")}</div>
    </div>
  `
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${cv.name} — CV</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Inter', 'Calibri', sans-serif;
      font-size: 10pt;
      color: #1a1a1a;
      background: #fff;
      line-height: 1.5;
    }

    .cv-page {
      max-width: 780px;
      margin: 0 auto;
      padding: 20mm 15mm;
    }

    /* Header */
    .cv-header { margin-bottom: 16px; }
    .cv-name {
      font-size: 24pt;
      font-weight: 700;
      letter-spacing: -0.5px;
      color: #111;
      margin-bottom: 6px;
    }
    .cv-contact {
      font-size: 9pt;
      color: #555;
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }
    .cv-contact a { color: #555; text-decoration: none; }
    .cv-contact span::before { content: "·"; margin-right: 16px; }
    .cv-contact span:first-child::before { content: ""; margin-right: 0; }

    /* Sections */
    .section { margin-bottom: 18px; }
    .section-title {
      font-size: 10pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #111;
      padding-bottom: 4px;
      border-bottom: 1.5px solid #d0d0d0;
      margin-bottom: 10px;
    }

    /* Summary */
    .summary-text { font-size: 9.5pt; color: #333; line-height: 1.6; }

    /* Skills */
    .skills-list { display: flex; flex-wrap: wrap; gap: 6px; }
    .skill-tag {
      background: #f3f4f6;
      border: 1px solid #e5e7eb;
      border-radius: 4px;
      padding: 2px 8px;
      font-size: 8.5pt;
      color: #374151;
    }

    /* Experience */
    .experience-item { margin-bottom: 14px; }
    .exp-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 4px;
    }
    .exp-left { display: flex; flex-direction: column; }
    .exp-title { font-size: 10pt; font-weight: 600; color: #111; }
    .exp-company { font-size: 9pt; color: #555; }
    .exp-dates { font-size: 9pt; color: #555; white-space: nowrap; margin-left: 12px; }

    .bullets { margin-left: 16px; }
    .bullets li {
      font-size: 9.5pt;
      color: #333;
      margin-bottom: 3px;
      line-height: 1.5;
    }

    /* Education */
    .edu-item { margin-bottom: 8px; }

    /* Certifications */
    .cert-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4px 16px;
    }
    .cert-item { font-size: 9pt; color: #333; }

    /* Cover Letter Page */
    .page-break { page-break-after: always; }
    .cover-letter-page {
      max-width: 780px;
      margin: 0 auto;
      padding: 20mm 15mm;
    }
    .cover-letter-title {
      font-size: 18pt;
      font-weight: 700;
      color: #111;
      margin-bottom: 24px;
      padding-bottom: 8px;
      border-bottom: 1.5px solid #d0d0d0;
    }
    .cover-letter-body p {
      font-size: 10.5pt;
      line-height: 1.7;
      color: #333;
      margin-bottom: 16px;
    }
  </style>
</head>
<body>
  <div class="cv-page">
    <header class="cv-header">
      <h1 class="cv-name">${cv.name}</h1>
      <div class="cv-contact">
        ${cv.contact.email ? `<span>${cv.contact.email}</span>` : ""}
        ${cv.contact.phone ? `<span>${cv.contact.phone}</span>` : ""}
        ${cv.contact.location ? `<span>${cv.contact.location}</span>` : ""}
        ${cv.contact.linkedin ? `<span><a href="${cv.contact.linkedin}">${cv.contact.linkedin}</a></span>` : ""}
      </div>
    </header>

    ${
      cv.summary
        ? `
    <section class="section">
      <h2 class="section-title">Professional Summary</h2>
      <p class="summary-text">${cv.summary}</p>
    </section>
    `
        : ""
    }

    ${
      cv.core_skills.length > 0
        ? `
    <section class="section">
      <h2 class="section-title">Core Skills</h2>
      <div class="skills-list">${skillsList}</div>
    </section>
    `
        : ""
    }

    ${
      cv.experience.length > 0
        ? `
    <section class="section">
      <h2 class="section-title">Experience</h2>
      ${experienceHtml}
    </section>
    `
        : ""
    }

    ${
      cv.education.length > 0
        ? `
    <section class="section">
      <h2 class="section-title">Education</h2>
      ${educationHtml}
    </section>
    `
        : ""
    }

    ${certificationsHtml}
    ${languagesHtml}
  </div>
  ${coverLetterHtml}
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  try {
    const { cvOutput, coverLetter } = await req.json();

    if (!cvOutput) {
      return NextResponse.json({ error: "No CV data provided" }, { status: 400 });
    }

    const html = buildCVHtml(cvOutput, coverLetter);

    // Try to use puppeteer if available
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const puppeteer = require("puppeteer-core");
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const chromium = require("@sparticuz/chromium");

      const browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      });

      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "networkidle0" });
      const pdf = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "0", bottom: "0", left: "0", right: "0" },
      });
      await browser.close();

      return new NextResponse(pdf, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${cvOutput.name.replace(/\s+/g, "_")}_CV.pdf"`,
        },
      });
    } catch (puppeteerError) {
      console.error("Puppeteer unavailable, returning HTML:", puppeteerError);
      // Fallback: return HTML for client-side print-to-PDF
      return new NextResponse(html, {
        headers: {
          "Content-Type": "text/html",
          "X-Fallback": "true",
        },
      });
    }
  } catch (error) {
    console.error("export-pdf error:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}

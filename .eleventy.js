const facts = require("./src/_data/facts.json");

// Resolve "%%company.orgNumber%%"-style tokens against facts.json.
function factValue(path) {
  const v = path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), facts);
  if (v === undefined || v === null || typeof v === "object") {
    throw new Error(`Unknown fact token %%${path}%% (check src/_data/facts.json)`);
  }
  return String(v);
}

module.exports = function (eleventyConfig) {
  // Translated strings carry %%path%% tokens for shared facts (product
  // count, prices, company details). Replace them in every built page so
  // all 11 languages read the same values; an unknown token fails the build.
  eleventyConfig.addTransform("facts", function (content) {
    if (typeof content !== "string" || !content.includes("%%")) return content;
    return content.replace(/%%([a-zA-Z0-9_.]+)%%/g, (_, path) => factValue(path));
  });
  eleventyConfig.addFilter("facts", (str) =>
    String(str ?? "").replace(/%%([a-zA-Z0-9_.]+)%%/g, (_, path) => factValue(path)),
  );

  // List placeholders still unfilled, once per build.
  eleventyConfig.on("eleventy.after", () => {
    const pending = [];
    (function walk(o, p) {
      for (const [k, v] of Object.entries(o)) {
        if (k.startsWith("_")) continue;
        if (v && typeof v === "object") walk(v, `${p}${k}.`);
        else if (typeof v === "string" && /^\[.*\]$/.test(v)) pending.push(`${p}${k} = ${v}`);
      }
    })(facts, "");
    if (pending.length) {
      console.warn(`[facts] ${pending.length} placeholder(s) still to fill in src/_data/facts.json:`);
      for (const line of pending) console.warn(`  ${line}`);
    }
  });

  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });
  eleventyConfig.addPassthroughCopy({ "src/CNAME": "CNAME" });
  eleventyConfig.addPassthroughCopy({ "src/.nojekyll": ".nojekyll" });
  eleventyConfig.addPassthroughCopy({ "src/favicon.svg": "favicon.svg" });
  eleventyConfig.addPassthroughCopy({ "src/favicon.ico": "favicon.ico" });
  eleventyConfig.addPassthroughCopy({ "src/favicon-32.png": "favicon-32.png" });
  eleventyConfig.addPassthroughCopy({ "src/apple-touch-icon.png": "apple-touch-icon.png" });
  eleventyConfig.addPassthroughCopy({ "src/icon-192.png": "icon-192.png" });
  eleventyConfig.addPassthroughCopy({ "src/icon-512.png": "icon-512.png" });
  eleventyConfig.addPassthroughCopy({ "src/icon-512-maskable.png": "icon-512-maskable.png" });
  eleventyConfig.addPassthroughCopy({ "src/site.webmanifest": "site.webmanifest" });

  // English is unprefixed (preserves existing SEO URLs); every other locale gets a /xx/ prefix.
  // Used in `permalink:` front matter — returns a path with a trailing slash, no leading slash.
  eleventyConfig.addFilter("localePath", (slug, locale) => {
    const clean = String(slug || "").replace(/^\/+|\/+$/g, "");
    const seg = clean ? `${clean}/` : "";
    return locale === "en" ? seg : `${locale}/${seg}`;
  });

  // Used in templates for hrefs — same as localePath but with a leading slash.
  eleventyConfig.addFilter("localeUrl", function (slug, locale) {
    const clean = String(slug || "").replace(/^\/+|\/+$/g, "");
    const seg = clean ? `${clean}/` : "";
    const path = locale === "en" ? seg : `${locale}/${seg}`;
    return `/${path}`;
  });

  // Looks up a locale's display name (e.g. "Deutsch") from site.locales by code —
  // used for the "not yet translated" notice on legal pages falling back to English.
  eleventyConfig.addFilter("localeName", (locales, code) => {
    const match = (locales || []).find((l) => l.code === code);
    return match ? match.name : code;
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
    templateFormats: ["njk", "html"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};

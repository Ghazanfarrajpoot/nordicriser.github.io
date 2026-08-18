module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });
  eleventyConfig.addPassthroughCopy({ "src/CNAME": "CNAME" });
  eleventyConfig.addPassthroughCopy({ "src/.nojekyll": ".nojekyll" });

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

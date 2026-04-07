const path = require("path");
const markdownIt = require("markdown-it")({
  html: false,
  linkify: true,
  typographer: true,
  // false: новый абзац только после пустой строки; иначе одиночные \n дают <br> между блоками
  breaks: false,
});

const PEOPLE_DATA_DIR = path.join(__dirname, "src", "_data", "people");
const PEOPLE_ITEMS_JS = path.join(__dirname, "src", "_data", "peopleItems.js");

module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("images");

  // Абсолютный путь + сам peopleItems.js: надёжнее, чем только относительная строка
  eleventyConfig.addWatchTarget(PEOPLE_DATA_DIR);
  eleventyConfig.addWatchTarget(PEOPLE_ITEMS_JS);

  // Node кэширует require(peopleItems.js) — при смене только .md модуль не перегружается
  eleventyConfig.on("eleventy.beforeWatch", function(queue) {
    if (!queue || !queue.length) return;
    const inPeople = queue.some((file) => {
      const unix = String(file).split(path.sep).join("/");
      return (
        unix.includes("/_data/people/") ||
        unix.endsWith("/_data/people/items.json") ||
        unix.endsWith("/peopleItems.js")
      );
    });
    if (!inPeople) return;
    try {
      delete require.cache[require.resolve(PEOPLE_ITEMS_JS)];
    } catch (_) {
      /* файл ещё не подключали */
    }
  });

  eleventyConfig.addFilter("markdown", function(value) {
    if (value === undefined || value === null || value === "") return "";
    return markdownIt.render(String(value));
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
    },
  };
};

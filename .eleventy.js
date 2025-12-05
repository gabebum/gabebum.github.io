module.exports = function(eleventyConfig) {
  // Копируем статические файлы
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("images");

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes"
    }
  };
};


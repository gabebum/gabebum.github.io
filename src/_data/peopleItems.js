const fs = require("fs");
const path = require("path");

const PEOPLE_DIR = path.join(__dirname, "people");

/**
 * Глобальные данные people: метаданные в people/items.json,
 * разметка модалки — в .md файлах в той же папке (поле md → имя файла).
 */
module.exports = function () {
  const itemsPath = path.join(PEOPLE_DIR, "items.json");
  const raw = JSON.parse(fs.readFileSync(itemsPath, "utf8"));

  return raw.map((item) => {
    const { md, ...rest } = item;
    if (!md || typeof md !== "string") {
      throw new Error(`people/items.json: у элемента «${item.title || "?"}» нет поля md`);
    }
    const mdPath = path.join(PEOPLE_DIR, md);
    if (!fs.existsSync(mdPath)) {
      throw new Error(`people: не найден файл ${md} (ожидался путь ${mdPath})`);
    }
    const body = fs.readFileSync(mdPath, "utf8");
    return { ...rest, body };
  });
};

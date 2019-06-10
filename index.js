const fs = require("fs");
const slugify = require("slugify");
const wikijs = require("wikijs").default;
const wiki = wikijs({ apiUrl: "http://it.wikipedia.org/w/api.php" });

const cache = {};
const getPages = async page => wiki.pagesInCategory(page);

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const saveFile = file =>
  !!file &&
  !!cache[file] &&
  fs.writeFileSync(
    `./data/${slugify(file)}.json`,
    JSON.stringify([...new Set(cache[file])], null, 4),
    "utf-8"
  ) &&
  delete cache[file];

let previous;
const rgx = /Categoria:([A-Za-z\s]+)/;
const rgxTop = /Categoria:Persone legate a(d)? ([A-Za-z\s]+)/;
const loopOverList = async (pages, groupBy) => {
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];

    if (page.match(rgx)) {
      let children;

      if (page.match(rgxTop) || (groupBy && !page.match(rgxTop))) {
        if (page.match(rgxTop)) {
          groupBy = page.match(rgxTop)[2];
          saveFile(previous);
          previous = groupBy;
        }
        console.log("processing", groupBy, page);
        try {
          children = await getPages(page);
        } catch (e) {
          console.log("waiting in", page);
          await sleep(5000);
          children = await getPages(page);
        }

        await loopOverList(children, groupBy);
      }
    } else {
      if (
        !groupBy ||
        page.match(
          /Villa([A-Za-z\ ]+)|Castello([A-Za-z\ ]+)|Palazzo([A-Za-z\ ]+)|Rocca([A-Za-z\ ]+)|Conti di ([A-Za-z\ ]+)|Duchi di ([A-Za-z\ ]+)|Sindaci di ([A-Za-z\ ]+)|Tiranni di ([A-Za-z\ ]+)/
        )
      ) {
        return;
      }
      cache[groupBy] = cache[groupBy] || [];
      cache[groupBy].push(page);
    }
  }
};

(async () => {
  const categories = await getPages(
    "Categoria:Persone_legate_a_città_italiane"
  );

  await loopOverList(categories);
  saveFile(previous);
})();

const fs = require("fs");
const slugify = require("slugify");
const wikijs = require("wikijs").default;
const wiki = wikijs({ apiUrl: "http://it.wikipedia.org/w/api.php" });

const cache = {};
const getPages = async page => wiki.pagesInCategory(page);
const normalise = (str = "") => str.replace(" (Italia)", "");
const slug = str => slugify(str.replace(/\'/g, "--"));
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const saveFile = file => {
  if (!!file && !!cache[file]) {
    fs.writeFileSync(
      `./lists/${slug(file)}.json`,
      JSON.stringify(
        {
          name: file,
          people: [...new Set(cache[file])],
        },
        null,
        4
      ),
      "utf-8"
    );
    delete cache[file];
  }
};
let previous;
const rgx = /Categoria:(.+)/;
const rgxTop = /Categoria:Persone legate a(d)? (.+)/;
const loopOverList = async (pages, groupBy) => {
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];

    if (page.match(rgx)) {
      let children;

      if (page.match(rgxTop) || (groupBy && !page.match(rgxTop))) {
        if (page.match(rgxTop)) {
          if (fs.existsSync(`./lists/${slug(page.match(rgxTop)[2])}.json`)) {
            continue;
          }
        }
        if (page.match(rgxTop)) {
          groupBy = page.match(rgxTop)[2];
          console.log(groupBy);

          saveFile(normalise(previous));
          previous = groupBy;
        }
        console.log(" ", page);
        try {
          children = await getPages(page);
        } catch (e) {
          console.log("waiting in", page);
          await sleep(2000);
          children = await getPages(page);
        }
        await loopOverList(children, groupBy);
      }
    } else {
      if (
        !groupBy ||
        page.match(
          /^Vicer(.+)|^Consorti(.+)|^Sovrani(.+)|^Allenatori(.+)|^Calciatori(.+)|^Villa(.+)|^Castello(.+)|^Palazzo(.+)|^Rocca(.+)|^Conti di (.+)|^Duchi di (.+)|^Sindaci di (.+)|^Tiranni di (.+)/
        )
      ) {
        return;
      }
      cache[normalise(groupBy)] = cache[normalise(groupBy)] || [];
      cache[normalise(groupBy)].push(page);
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

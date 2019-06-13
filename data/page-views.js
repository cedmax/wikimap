const pageviews = require("pageviews");
const fs = require("fs");
const requireFolderTree = require("require-folder-tree");
const rimraf = require("rimraf");
const citiesData = requireFolderTree(`${__dirname}/data`);

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const end = new Date();
const start = new Date(end - 5 * 365 * 24 * 60 * 60 * 1000);
const chunkSize = 15;

const fetch = async (list, { start, end }, counter = 0) => {
  try {
    return await pageviews.getPerArticlePageviews({
      articles: list,
      project: "it.wikipedia",
      start,
      end,
    });
  } catch (e) {
    if (counter > 4) throw e;
    counter++;
    console.log("ouch, retrying");
    await sleep(2500);
    return fetch(list, { start, end }, counter);
  }
};
const getPageViews = async (name, array, counter) => {
  const list = array.splice(0, chunkSize);

  if (!fs.existsSync(`./tmp/${name}-${counter}.json`)) {
    const pageViewData = await fetch(list, { start, end });

    fs.writeFileSync(
      `./tmp/${name}-${counter}.json`,
      JSON.stringify(
        list.map((page, i) => ({
          page,
          pageView: pageViewData[i].items.reduce(
            (acc, { views }) => acc + views,
            0
          ),
        }))
      )
    );
  }
  if (array.length) {
    console.log(Math.ceil(array.length / chunkSize));
    return await getPageViews(name, array, ++counter);
  } else {
    const chunks = requireFolderTree(`${__dirname}/tmp`);
    console.log(`deleting ./tmp/${name}-*.json`);
    rimraf.sync(`./tmp/${name}-*.json`);
    return Object.keys(chunks)
      .filter(chunk => chunk.includes(name))
      .reduce((acc, chunk) => acc.concat(chunks[chunk]), []);
  }
};

const failed = [];
(async () => {
  const cities = Object.keys(citiesData);

  for (let i = 0; i < cities.length; i++) {
    if (!fs.existsSync(`./results/${cities[i]}.json`)) {
      const { people, name } = citiesData[cities[i]];
      const chunks = Math.ceil(people.length / chunkSize);
      console.log(name, "=>", chunks, "chunks");
      let results;
      try {
        results = await getPageViews(name, people, 0);
        fs.writeFileSync(
          `./results/${cities[i]}.json`,
          JSON.stringify(
            {
              name,
              people: results.sort(
                ({ pageView }, { pageView: pageViewb }) => pageViewb - pageView
              ),
            },
            null,
            4
          ),
          "utf-8"
        );
      } catch (e) {
        console.log(e);
        failed.push(name);
      }
    }
  }
  console.log("failed:", failed);
})();

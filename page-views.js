const pageviews = require("pageviews");
const fs = require("fs");
const requireFolderTree = require("require-folder-tree");
const citiesData = requireFolderTree(`${__dirname}/data`);

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const end = new Date("2019-06-01");
const start = new Date(end - 365 * 24 * 60 * 60 * 1000);
const chunkSize = 10;

const getPageViews = async (acc, array) => {
  const list = array.splice(0, chunkSize);
  let pageViewData;
  try {
    pageViewData = await pageviews.getPerArticlePageviews({
      articles: list,
      project: "it.wikipedia",
      start: new Date(new Date() - 365 * 24 * 60 * 60 * 1000),
      end: new Date(new Date()),
    });
  } catch (e) {
    console.log("ouch, retrying");
    await sleep(5000);
    pageViewData = await pageviews.getPerArticlePageviews({
      articles: list,
      project: "it.wikipedia",
      start,
      end,
    });
  }

  acc = acc.concat(
    list.map((page, i) => ({
      page,
      pageView: pageViewData[i].items.reduce(
        (acc, { views }) => acc + views,
        0
      ),
    }))
  );
  if (array.length) {
    console.log(Math.ceil(array.length / chunkSize));
    return await getPageViews(acc, array);
  } else {
    return acc;
  }
};

(async () => {
  const cities = Object.keys(citiesData);

  for (let i = 0; i < cities.length; i++) {
    if (!fs.existsSync(`./results/${cities[i]}.json`)) {
      const { people, name } = citiesData[cities[i]];
      const chunks = Math.ceil(people.length / chunkSize);
      console.log(name, "=>", chunks, "chunks");
      const results = await getPageViews([], people);

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
    }
  }
})();

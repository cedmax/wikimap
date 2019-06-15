const fs = require("fs");
const wikijs = require("wikijs").default;
const wiki = wikijs({ apiUrl: "http://it.wikipedia.org/w/api.php" });
const data = require("./rank.json");
const { features } = data;
const slugify = require("slugify");
const slug = str => slugify(str.replace(/\'/g, "--"));

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const getFeatureInfo = async feature => {
  console.log(feature.text);
  let summary;
  if (fs.existsSync(`./people/${slug(feature.properties.name)}.json`)) {
    const page = require(`./people/${slug(feature.properties.name)}.json`);
    summary = page.summary;
  } else {
    try {
      const page = await wiki.page(feature.properties.name);
      summary = await page.summary();
      fs.writeFileSync(
        `./people/${slug(feature.properties.name)}.json`,
        JSON.stringify(
          {
            summary,
          },
          null,
          4
        ),
        "utf-8"
      );
    } catch (e) {
      await sleep(2000);
      return await getFeatureInfo(feature);
    }
  }
  feature.properties.summary = summary;
  return feature;
};

(async () => {
  for (let i = 0; i < features.length; i++) {
    features[i] = await getFeatureInfo(features[i]);
  }
  fs.writeFileSync(
    "./data.json",
    JSON.stringify(
      {
        ...data,
        features,
      },
      null,
      4
    ),
    "utf-8"
  );
})();

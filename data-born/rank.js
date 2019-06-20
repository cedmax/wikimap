const fs = require("fs");
const data = require("./geolocation.json");
const views = data.features.map(feat => feat.properties.views);
const min = Math.min(...views);
const max = Math.max(...views);

const thresholdValue = Math.ceil((max - min) / 8);

let value = max;
const thresholds = [max];
while (value > min) {
  value = value - thresholdValue;
  thresholds.push(value);
}

let { features } = data;
thresholds.forEach((thresholdValue, i) => {
  features = features.map(feat => {
    if (feat.properties.views <= thresholdValue) {
      feat.properties.symbolrank = 11 + i;
    }
    delete feat.rank;
    return feat;
  });
}, []);

fs.writeFileSync(
  "./rank.json",
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

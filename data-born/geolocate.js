const axios = require("axios");
const fs = require("fs");
const requireFolderTree = require("require-folder-tree");
const cities = requireFolderTree(`${__dirname}/results`);
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  const results = [];
  const keys = Object.keys(cities);
  for (let i = 0; i < keys.length; i++) {
    const data = cities[keys[i]];
    console.log(data.name);
    let geoData;
    if (fs.existsSync(`./geolocation/${keys[i]}.json`)) {
      geoData = require(`./geolocation/${keys[i]}.json`);
    } else {
      const { data: mapBoxData } = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          data.name
        )}%20Italy.json?access_token=pk.eyJ1IjoiY2VkbWF4IiwiYSI6ImNpenBrZDhkazAwMTUyd255cWpocjFpMmYifQ.OBuGt4CZx9oezTqD0-JYaw`
      );
      geoData = mapBoxData;
      const geo = geoData.features[0];
      delete geo.context;
      delete geo.properties;
      fs.writeFileSync(
        `geolocation/${keys[i]}.json`,
        JSON.stringify(geo, null, 4),
        "utf-8"
      );
    }
    try {
      geoData.properties = {
        name: data.people[0].page,
        views: data.people[0].pageView,
        location: data.name,
      };
      if (data.people[0].pageView) {
        results.push(geoData);
      }
    } catch (e) {
      console.log("######### FAILED");
    }
  }

  fs.writeFileSync(
    `./geolocation.json`,
    JSON.stringify(
      {
        type: "FeatureCollection",
        features: results,
      },
      null,
      4
    ),
    "utf-8"
  );
})();

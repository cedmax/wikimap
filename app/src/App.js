import React, { Fragment } from "react";
import ReactMapGL, { NavigationControl } from "react-map-gl";
import Toggle from "react-toggle";
import "./App.css";

const dataSources = {
  related: {
    mapStyle: "mapbox://styles/cedmax/cjwxac3el374z1cn3b0r5idkd",
    mapStyleWCities: "mapbox://styles/cedmax/cjwxawjf41tsj1cnyxcpng4li",
  },
  born: {
    mapStyle: "mapbox://styles/cedmax/cjx4s37kg29il1dpc2d1y5vwi",
    mapStyleWCities: "mapbox://styles/cedmax/cjx4s5h030lxq1cp5o7ykt7dp",
  },
};

const Summary = ({ selected }) => (
  <Fragment>
    {selected.summary.split(".")[0]}{" "}
    <a
      target="_blank"
      rel="noopener noreferrer"
      href={`https://it.wikipedia.org/wiki/${selected.name}`}
    >
      wiki
    </a>
  </Fragment>
);

export default class Map extends React.Component {
  state = {
    selected: null,
    mapStyle: dataSources.related.mapStyle,
    source: "related",
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
      longitude: 12.48278,
      latitude: 41.89306,
      zoom: 4.9,
    },
    style: {
      cursor: "default",
    },
  };

  toggleStyle = e => {
    const { source } = this.state;
    const { mapStyle, mapStyleWCities } = dataSources[source];

    this.setState({
      mapStyle: this.state.mapStyle === mapStyle ? mapStyleWCities : mapStyle,
    });
  };

  toggleDataSource = e => {
    const { source } = this.state;
    const { mapStyle: currentMapStyle } = dataSources[source];

    const newSource = source === "related" ? "born" : "related";
    const { mapStyle, mapStyleWCities } = dataSources[newSource];

    this.setState({
      source: newSource,
      mapStyle:
        this.state.mapStyle === currentMapStyle ? mapStyle : mapStyleWCities,
    });
  };

  constructor(props) {
    super(props);

    window.addEventListener("resize", () => {
      window.requestAnimationFrame(() => {
        this.setState({
          viewport: {
            ...this.state.viewport,
            width: window.innerWidth,
            height: window.innerHeight,
          },
        });
      });
    });
  }

  render() {
    return (
      <ReactMapGL
        onClick={layer => {
          const feature = layer.features && layer.features[0];

          if (feature && feature.layer.id === "labels") {
            this.setState({
              selected: feature.properties,
            });
          } else {
            this.setState({
              selected: null,
            });
          }
        }}
        onHover={layer => {
          const feature = layer.features && layer.features[0];

          if (feature && feature.layer.id === "labels") {
            document.getElementById("dynamic").innerHTML =
              "* {cursor:pointer!important}";
          } else {
            document.getElementById("dynamic").innerHTML = "* {cursor:inherit}";
          }
        }}
        mapStyle={this.state.mapStyle}
        style={this.state.style}
        mapboxApiAccessToken="pk.eyJ1IjoiY2VkbWF4IiwiYSI6ImNpenBrZDhkazAwMTUyd255cWpocjFpMmYifQ.OBuGt4CZx9oezTqD0-JYaw"
        {...this.state.viewport}
        onViewportChange={viewport => {
          this.setState({ viewport });
        }}
      >
        <h1>
          A People Map of Italy{" "}
          <small>
            by{" "}
            <a href="https://cedmax.com" target="__blank">
              cedmax
            </a>
            <span className="data-source">
              dati:{" "}
              <label>
                <a
                  rel="noopener noreferrer"
                  target="_blank"
                  href="https://it.wikipedia.org/wiki/Categoria:Persone_legate_a_citt%C3%A0_italiane"
                >
                  legame
                </a>{" "}
                <Toggle icons={false} onChange={this.toggleDataSource} />{" "}
                <a
                  rel="noopener noreferrer"
                  target="_blank"
                  href="https://it.wikipedia.org/wiki/Categoria:Nati_in_Italia"
                >
                  nascita
                </a>
              </label>
            </span>
          </small>
        </h1>
        <div className="nav">
          <NavigationControl />
          <div className="added mapboxgl-ctrl mapboxgl-ctrl-group">
            <button
              onClick={this.toggleStyle}
              className={`show-cities mapboxgl-ctrl-icon${
                this.state.mapStyle === dataSources[this.state.source].mapStyle
                  ? " mapboxgl-ctrl-icon-disabled"
                  : ""
              }`}
            />
            <button
              onClick={() => {
                window.open("https://pudding.cool/2019/05/people-map/");
              }}
              className="information mapboxgl-ctrl-icon"
            />
          </div>
        </div>
        {this.state.selected && (
          <div className="summary">
            <Summary selected={this.state.selected} />
          </div>
        )}
      </ReactMapGL>
    );
  }
}

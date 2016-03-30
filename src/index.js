'use strict';

// interaction components
import EventCapture from "./lib/EventCapture";

// common Components
import Chart from "./lib/Chart"
import ChartCanvas from "./lib/ChartCanvas";
import * as Utils from "./lib/utils";
import helper from "./lib/helper";
import axes from "./lib/axes";
import DataSeries from "./lib/DataSeries";
import series from "./lib/series";
import transforms from "./lib/transforms";
import coordinates from "./lib/coordinates";

const version = "0.0.1";

export default {
	Chart,
	ChartCanvas,
	DataSeries,
	helper,
	series,
	version,
	helper,
	axes,
	transforms,
	coordinates,
	EventCapture,
	Utils
};

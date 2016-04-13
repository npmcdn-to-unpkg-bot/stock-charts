"use strict";

// interaction components
import EventCapture from "./lib/EventCapture";

// common Components
import Chart from "./lib/Chart";
import ChartCanvas from "./lib/ChartCanvas";
import * as Utils from "./lib/utils";
import helper from "./lib/helper";
import axes from "./lib/axes";
import series from "./lib/series";
import coordinates from "./lib/coordinates";
import * as scale from "./lib/scale";
import * as tooltip from "./lib/tooltip";

const version = "0.0.1";

export default {
	Chart,
	ChartCanvas,
	helper,
	series,
	version,
	axes,
	coordinates,
	EventCapture,
	Utils,
	scale,
	tooltip,
};

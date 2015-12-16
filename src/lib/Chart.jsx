"use strict"

import React from 'react';

import PureComponent from "./utils/PureComponent";

class Chart extends PureComponent {
	render() {
		return (
			<div></div>
		);
	}
}

Chart.propTypes = {

};

Chart.contextTypes = {
	width: React.PropTypes.number.isRequired,
	height: React.PropTypes.number.isRequired,
	chartData: React.PropTypes.array,
	margin: React.PropTypes.object.isRequired,
	interactiveState: React.PropTypes.array.isRequired,
	// adding here even when this is not used by Chart, refer to https://github.com/facebook/react/issues/2517
};

Chart.childContextTypes = {
	xScale: React.PropTypes.func.isRequired,
	yScale: React.PropTypes.func.isRequired,
	xAccessor: React.PropTypes.func.isRequired,
	chartData: React.PropTypes.object.isRequired,
	overlays: React.PropTypes.array.isRequired,
	compareSeries: React.PropTypes.array.isRequired,
	width: React.PropTypes.number.isRequired,
	height: React.PropTypes.number.isRequired,
	canvasOriginX: React.PropTypes.number,
	canvasOriginY: React.PropTypes.number,
	chartId: React.PropTypes.number.isRequired,
};

export default Chart;

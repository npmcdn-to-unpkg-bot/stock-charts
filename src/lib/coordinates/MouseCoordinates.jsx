"use strict";

import React from 'react';

import pure from '../pure';

class MouseCoordinates extends React.Component {
	componentDidMount() {
		var { chartCanvasType, getCanvasContexts } = this.props;

		if (chartCanvasType !== "svg" && getCanvasContexts !== undefined) {

		}
	}

	componentDidUpdate() {
		this.componentDidMount()
	}

	componentWillMount() {
		this.componentWillReceiveProps(this.props, this.props);
	}

	componentWillReceiveProps(nextProps) {

	}

	render() {
	var { chartCanvasType, mouseXY, currentCharts, chartData, currentItems, show } = this.props;
	var { stroke, opacity, textStroke, textBGFill, textBGopacity, fontFamily, fontSize } = this.props;

	if (chartCanvasType !== "svg") return null;

	var pointer = MouseCoordinates.helper(this.props, show, mouseXY, currentCharts, chartData, currentItems);
		return (
			<div></div>
		);
	}
}

MouseCoordinates.helper = (props, show, mouseXY, currentCharts, chartData, currentItems) => {
	if (!show) return;
	var { mainChart, dateAccessor, height, width, snapX, xDisplayFormat } = props;
	var edges = chartData
		.filter((eachChartData) => currentCharts.indexOf(eachChartData.id) > -1)
		.map((each) => {

		});
};

export default pure(MouseCoordinates, {
	width: React.PropTypes.number.isRequired,
	height: React.PropTypes.number.isRequired,
	mainChart: React.PropTypes.number.isRequired,
	show: React.PropTypes.bool,
	mouseXY: React.PropTypes.array,
	dateAccessor: React.PropTypes.func,
	chartData: React.PropTypes.array.isRequired,
	currentItems: React.PropTypes.array.isRequired,
	currentCharts: React.PropTypes.array.isRequired,
	getCanvasContexts: React.PropTypes.func,
	margin: React.PropTypes.object.isRequired,
	// secretToSuperFastCanvasDraw: React.PropTypes.array.isRequired,
	callbackForCanvasDraw: React.PropTypes.func.isRequired,
	getAllCanvasDrawCallback: React.PropTypes.func,
	chartCanvasType: React.PropTypes.string.isRequired,
});

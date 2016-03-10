"use strict";

import React from "react";
import PureComponent from "./utils/PureComponent";
import { getMainChart, getChartDataConfig, getChartData, getDataToPlotForDomain } from "./utils/ChartDataUtil";
import { DummyTransformer } from "./transforms";
import { isReactVersion13 } from "./utils/utils";

import objectAssign from "object-assign";

function getLongValue(value) {
	if (value instanceof Date) {
		return value.getTime();
	}
	return value;
}
class EventHandler extends PureComponent {
	constructor(props, context) {
		super(props, context);
		this.handleMouseEnter = this.handleMouseEnter.bind(this);
		this.getCanvasContexts = this.getCanvasContexts.bind(this);
		this.pushCallbackForCanvasDraw = this.pushCallbackForCanvasDraw.bind(this);

		this.canvasDrawCallbackList = [];

		this.state = {
			show: false,
			mouseXY: [0, 0],
		};

	}
	getTransformedData(rawData, defaultDataTransform, dataTransform, interval) {
		var i = 0, eachTransform, options = {}, data = rawData;
		var transforms = defaultDataTransform.concat(dataTransform);
		for (i = 0; i < transforms.length; i++) {
			//console.log(transforms[i]);
			eachTransform = transforms[i].transform();
			options = objectAssign({}, options, transforms[i].options);
			options = eachTransform.options(options);
			data = eachTransform(data, interval);
		}
		return {
			data: data,
			options: options
		};
	}
	componentWillMount() {
		var { props } = this;
		var { initialDisplay, rawData, defaultDataTransform, dataTransform, interval, dimensions } = props;

		var transformedData = this.getTransformedData(rawData, defaultDataTransform, dataTransform, interval);

		var { data, options } = transformedData;

		var dataForInterval = data[interval];

		var mainChart = getMainChart(props.children);
		var beginIndex = Math.max(dataForInterval.length - initialDisplay, 0);
		var plotData = dataForInterval.slice(beginIndex); // Main Data After the beginIndex.
		var chartConfig = getChartDataConfig(props, dimensions, options);

		var chart = chartConfig.filter((eachChart) => eachChart.id ===mainChart)[0];

		var domainL = getLongValue(chart.config.xAccessor(plotData[0]));
		var domainR = getLongValue(chart.config.xAccessor(plotData[plotData.length - 1]));

		var dataToPlot = getDataToPlotForDomain(domainL, domainR, data, chart.config.width, chart.config.xAccessor);
		var updatePlotData = dataToPlot.data;

		var chartData = getChartData(props, dimensions, plotData, data, options);

		this.setState({
			data: data,
			rawData: rawData,
			options: options,
			plotData: updatePlotData,
			chartData: chartData,
			interval: this.props.interval,
			mainChart: mainChart,
			currentCharts: [mainChart],
			initialRender: true,
		});
	}
	componentWillReceiveProps(nextProps) {
		console.log("In componentWillReceiveProps");
	}
	getCanvasContexts() {
		return this.state.canvas || this.props.canvasContexts();
	}
	getChildContext() {
		return {
			plotData: this.state.plotData,
			chartData: this.state.chartData,
			currentItems: this.state.currentItems,
			mainChart: this.state.mainChart,
			show: this.state.show,
			mouseXY: this.state.mouseXY,
			interval: this.state.interval,
			currentCharts: this.state.currentCharts,
			width: this.props.dimensions.width,
			height: this.props.dimensions.height,
			chartCanvasType: this.props.type,
			dateAccessor: this.state.options.dateAccessor,

			margin: this.props.margin,
			dataTransform: this.props.dataTransform,
			interactiveState: this.state.interactiveState,

			callbackForCanvasDraw: this.pushCallbackForCanvasDraw,
			getAllCanvasDrawCallback: this.getAllCanvasDrawCallback,
			subscribe: this.subscribe,
			unsubscribe: this.unsubscribe,
			getCanvasContexts: this.getCanvasContexts,
			onMouseMove: this.handleMouseMove,
			onMouseEnter: this.handleMouseEnter,
			onMouseLeave: this.handleMouseLeave,
			onZoom: this.handleZoom,
			onPanStart: this.handlePanStart,
			onPan: this.handlePan,
			onPanEnd: this.handlePanEnd,
			onFocus: this.handleFocus,
			deltaXY: this.deltaXY,
			panInProgress: this.state.panInProgress,
			focus: this.state.focus
		};
	}
	pushCallbackForCanvasDraw(findThis, replaceWith) {
		var { canvasDrawCallbackList } = this;
		if (replaceWith) {
			canvasDrawCallbackList.forEach((each, idx) => {
				if (each === findThis) {
					canvasDrawCallbackList[idx] = replaceWith;
				}
			});
		} else {
			canvasDrawCallbackList.push(findThis);
		}
	}
	handleMouseEnter() {
		var { type, canvasContexts } = this.props;
		var { canvases } = this.state;
		if (type === "svg") {
			canvases = null;
		} else {
			canvases = canvasContexts();
		}
		this.setState({
			show: true,
			canvases: canvases,
		});
	}
	render() {
		var children = React.Children.map(this.props.children, (child) => {
			var newChild = isReactVersion13()
				? React.withContext(this.getChildContext(), () => {
					return React.createElement(child.type, objectAssign({key: child.key, ref: child.ref}, child.props));
				})
				: child;

		return newChild;
		});
		return (
			<g>{children}</g>
		);
	}
}

EventHandler.defaultProps = {
	defaultDataTransform: [ { transform: DummyTransformer } ],
};

EventHandler.childContextTypes = {
	plotData: React.PropTypes.array,
	chartData: React.PropTypes.array,
	currentItems: React.PropTypes.array,
	show: React.PropTypes.bool,
	mouseXY: React.PropTypes.array,
	interval: React.PropTypes.string,
	currentCharts: React.PropTypes.array,
	mainChart: React.PropTypes.number,
	width: React.PropTypes.number.isRequired,
	height: React.PropTypes.number.isRequired,
	chartCanvasType: React.PropTypes.oneOf(["svg", "hybrid"]).isRequired,
	dateAccessor: React.PropTypes.func,

	margin: React.PropTypes.object.isRequired,
	dataTransform: React.PropTypes.array,
	interactiveState: React.PropTypes.array.isRequired,

	subscribe: React.PropTypes.func,
	unsubscribe: React.PropTypes.func,
	callbackForCanvasDraw: React.PropTypes.func,
	getAllCanvasDrawCallback: React.PropTypes.func,
	getCanvasContexts: React.PropTypes.func,
	onMouseMove: React.PropTypes.func,
	onMouseEnter: React.PropTypes.func,
	onMouseLeave: React.PropTypes.func,
	onZoom: React.PropTypes.func,
	onPanStart: React.PropTypes.func,
	onPan: React.PropTypes.func,
	onPanEnd: React.PropTypes.func,
	panInProgress: React.PropTypes.bool.isRequired,
	focus: React.PropTypes.bool.isRequired,
	onFocus: React.PropTypes.func,
	deltaXY: React.PropTypes.func,
};

export default EventHandler;

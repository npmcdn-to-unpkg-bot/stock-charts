"use strict";

import React from "react";
import PureComponent from "./utils/PureComponent";
import { getMainChart, getChartDataConfig, getChartData, getDataToPlotForDomain, getCurrentItems } from "./utils/ChartDataUtil";
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
		/* Event Handlers */
		this.handleMouseEnter = this.handleMouseEnter.bind(this);
		this.handleMouseMove = this.handleMouseMove.bind(this);
		this.handleMouseLeave = this.handleMouseLeave.bind(this);

		this.getCanvasContexts = this.getCanvasContexts.bind(this);
		this.pushCallbackForCanvasDraw = this.pushCallbackForCanvasDraw.bind(this);

		this.subscriptions = [];

		this.canvasDrawCallbackList = [];

		this.state = {
			show: false,
			mouseXY: [0, 0],
			currentItems: [],
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
	handleMouseMove(mouseXY, e) {
		var currentCharts = this.state.chartData.filter((chartData) => {
			var top = chartData.config.origin[1];
			var bottom = top + chartData.config.height;
			return (mouseXY[1] > top && mouseXY[1] < bottom);
		}).map((chartData) => chartData.id);

		var currentItems = getCurrentItems(this.state.chartData, mouseXY, this.state.plotData);

		var interactiveState = this.triggerCallback(
			"mousemove",
			objectAssign({}, this.state, { currentItems, currentCharts }),
			this.state.interactiveState,
			e);

		var contexts = this.getCanvasContexts();

		if (contexts && contexts.mouseCoord) {
			this.clearCanvas([contexts.mouseCoord]);
		}
		// console.log(interactiveState === this.state.interactiveState);
		if (interactiveState !== this.state.interactiveState) this.clearInteractiveCanvas();

		this.setState({
			mouseXY: mouseXY,
			currentItems: currentItems,
			show: true,
			currentCharts,
			interactiveState,
		});
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
	handleMouseLeave() {
		var contexts = this.getCanvasContexts();

		if (contexts && contexts.mouseCoord) {
			this.clearCanvas([contexts.mouseCoord]);
		}

		this.setState({
			show: false
		});
	}
	triggerCallback(eventType, state, interactiveState, event) {
		var { plotData, mouseXY, currentCharts, chartData, currentItems } = state;
		var callbackList = this.subscriptions.filter(each => each.eventType === eventType);
		var delta = callbackList.map(each => {
			var singleChartData = chartData.filter(eachItem => eachItem.id === each.forChart)[0];
			var singleCurrentItem = currentItems.filter(eachItem => eachItem.id === each.forChart)[0];
			return {
				callback: each.callback,
				forChart: each.forChart,
				plotData,
				mouseXY,
				currentCharts,
				currentItem: singleCurrentItem.data,
				chartData: singleChartData
			};
		})
		.filter(each => each.currentCharts.indexOf(each.forChart) >= -1)
		.map(each => each.callback({
			plotData: each.plotData,
			mouseXY: each.mouseXY,
			chartData: each.chartData,
			currentItem: each.currentItem,
		}, event));

		// console.log(delta.length);
		if (delta.length === 0) return interactiveState;

		var i = 0, j = 0, added = false;
		var newInteractiveState = interactiveState.slice(0);
		for (i = 0; i < delta.length; i++) {
			var each = delta[i];
			for (j = 0; j < newInteractiveState.length; j++) {
				if (each.id === newInteractiveState[j].id) {
					newInteractiveState[j] = each;
					added = true;
				}
			}
			if (!added) newInteractiveState.push(each);
			added = false;
		}
		return newInteractiveState;
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

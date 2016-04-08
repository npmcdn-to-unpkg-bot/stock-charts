"use strict";

import React, { PropTypes, Component } from "react";
import PureComponent from "./utils/PureComponent";
import { getNewChartConfig, getChartConfigWithUpdatedYScales, getCurrentItems } from "./utils/ChartDataUtil";
import { DummyTransformer } from "./transforms";
import {
	last,
	isDefined,
	isNotDefined,
	clearCanvas,
	getClosestItemIndexes,
	shallowEqual,
} from "./utils";

import objectAssign from "object-assign";

function getLongValue(value) {
	if (value instanceof Date) {
		return value.getTime();
	}
	return value;
}

function setXRange(xScale, dimensions, padding, direction = 1) {
	if (xScale.rangeRoundPoints) {
		if (isNaN(padding)) throw new Error("padding has to be a number for ordinal scale");
		xScale.rangeRoundPoints([0, dimensions.width], padding);
	} else {
		var { left, right } = isNaN(padding)
			? padding
			: { left: padding, right: padding };
		if (direction > 0) {
			xScale.range([left, dimensions.width - right]);
		} else {
			xScale.range([dimensions.width - right, left]);
		}
	}
	return xScale;
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

		var { plotData, showingInterval, direction } = this.props;
		var { xScale, dimensions, children, postCalculator, padding } = this.props;

		plotData = postCalculator(plotData);

		var chartConfig = getChartConfigWithUpdatedYScales(getNewChartConfig(dimensions, children), plotData);

		this.setState({
			showingInterval,
			xScale: setXRange(xScale, dimensions, padding, direction),
			plotData,
			chartConfig,
		});
	}
	componentWillReceiveProps(nextProps) {
		console.log("In componentWillReceiveProps");
	}
	getCanvasContexts() {
		return this.state.canvas || this.props.canvasContexts();
	}
	getChildContext() {
		var { showingInterval } = this.state;
		var { fullData } = this.props;
		return {
			plotData: this.state.plotData,
			data: isDefined(showingInterval) ? fullData[showingInterval] : fullData,
			chartConfig: this.state.chartConfig,
			currentCharts: this.state.currentCharts,
			currentItem: this.state.currentItem,
			show: this.state.show,
			mouseXY: this.state.mouseXY,
			interval: this.state.showingInterval,
			width: this.props.dimensions.width,
			height: this.props.dimensions.height,
			chartCanvasType: this.props.type,
			xScale: this.state.xScale,
			xAccessor: this.props.xAccessor,

			margin: this.props.margin,
			interactiveState: this.state.interactiveState,

			callbackForCanvasDraw: this.pushCallbackForCanvasDraw,
			getAllCanvasDrawCallback: this.getAllCanvasDrawCallback,
			subscribe: this.subscribe,
			unsubscribe: this.unsubscribe,
			setInteractiveState: this.setInteractiveState,
			getCanvasContexts: this.getCanvasContexts,
			onMouseMove: this.handleMouseMove,
			onMouseEnter: this.handleMouseEnter,
			onMouseLeave: this.handleMouseLeave,
			onZoom: this.handleZoom,
			onPinchZoom: this.handlePinchZoom,
			onPanStart: this.handlePanStart,
			onPan: this.handlePan,
			onPanEnd: this.handlePanEnd,
			onFocus: this.handleFocus,
			deltaXY: this.state.deltaXY,
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
		return (
			<g>{this.props.children}</g>
		);
	}
}

EventHandler.defaultProps = {
	defaultDataTransform: [ { transform: DummyTransformer } ],
};

EventHandler.childContextTypes = {
	plotData: PropTypes.array,
	data: PropTypes.array,
	chartConfig: PropTypes.arrayOf(
		PropTypes.shape({
			id: PropTypes.number.isRequired,
			origin: PropTypes.arrayOf(PropTypes.number).isRequired,
			padding: PropTypes.oneOfType([
				PropTypes.number,
				PropTypes.shape({
					top: PropTypes.number,
					bottom: PropTypes.number,
				})
			]),
			yExtents: PropTypes.arrayOf(PropTypes.func).isRequired,
			yScale: PropTypes.func.isRequired,
			mouseCoordinates: PropTypes.shape({
				at: PropTypes.string,
				format: PropTypes.func
			}),
			width: PropTypes.number.isRequired,
			height: PropTypes.number.isRequired,
		})
	).isRequired,
	xScale: PropTypes.func.isRequired,
	xAccessor: PropTypes.func.isRequired,
	currentItem: PropTypes.object,
	show: PropTypes.bool,
	mouseXY: PropTypes.array,
	interval: PropTypes.string,
	currentCharts: PropTypes.array,
	mainChart: PropTypes.number,
	width: PropTypes.number.isRequired,
	height: PropTypes.number.isRequired,
	chartCanvasType: PropTypes.oneOf(["svg", "hybrid"]).isRequired,
	dateAccessor: PropTypes.func,

	margin: PropTypes.object.isRequired,
	dataTransform: PropTypes.array,
	interactiveState: PropTypes.array.isRequired,

	subscribe: PropTypes.func,
	unsubscribe: PropTypes.func,
	setInteractiveState: PropTypes.func,
	callbackForCanvasDraw: PropTypes.func,
	getAllCanvasDrawCallback: PropTypes.func,
	getCanvasContexts: PropTypes.func,
	onMouseMove: PropTypes.func,
	onMouseEnter: PropTypes.func,
	onMouseLeave: PropTypes.func,
	onZoom: PropTypes.func,
	onPinchZoom: PropTypes.func,
	onPanStart: PropTypes.func,
	onPan: PropTypes.func,
	onPanEnd: PropTypes.func,
	panInProgress: PropTypes.bool.isRequired,
	focus: PropTypes.bool.isRequired,
	onFocus: PropTypes.func,
	deltaXY: PropTypes.arrayOf(Number),
};

export default EventHandler;

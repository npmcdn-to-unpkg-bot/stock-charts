"use strict";

import React, {
	PropTypes, Component
}
from "react";

import {
	getNewChartConfig, getChartConfigWithUpdatedYScales, getCurrentCharts, getCurrentItem
}
from "./utils/ChartDataUtil";
import {
	last,
	isDefined,
	isNotDefined,
	clearCanvas,
	getClosestItemIndexes,
	shallowEqual,
}
from "./utils";

function isLastItemVisible(fullData, plotData) {
	if (Array.isArray(fullData)) {
		return last(plotData) === last(fullData);
	}
	var visible = false;
	for (let key in fullData) {
		visible = visible || last(fullData[key]) === last(plotData);
	}
	return visible;
}


function setXRange(xScale, dimensions, padding, direction = 1) {
	if (xScale.rangeRoundPoints) {
		if (isNaN(padding)) throw new Error("padding has to be a number for ordinal scale");
		xScale.rangeRoundPoints([0, dimensions.width], padding);
	} else {
		var {
			left, right
		} = isNaN(padding) ? padding : {
			left: padding,
			right: padding
		};
		if (direction > 0) {
			xScale.range([left, dimensions.width - right]);
		} else {
			xScale.range([dimensions.width - right, left]);
		}
	}
	return xScale;
}

class EventHandler extends Component {
	constructor(props, context) {
		super(props, context);
		/* Event Handlers */
		this.handleMouseEnter = this.handleMouseEnter.bind(this);
		this.handleMouseMove = this.handleMouseMove.bind(this);
		this.handleMouseLeave = this.handleMouseLeave.bind(this);
		this.handlePanStart = this.handlePanStart.bind(this);
		this.handlePan = this.handlePan.bind(this);
		this.handlePanEnd = this.handlePanEnd.bind(this);
		this.handleFocus = this.handleFocus.bind(this);
		this.handleZoom = this.handleZoom.bind(this);

		this.getCanvasContexts = this.getCanvasContexts.bind(this);
		this.pushCallbackForCanvasDraw = this.pushCallbackForCanvasDraw.bind(this);
		this.getAllCanvasDrawCallback = this.getAllCanvasDrawCallback.bind(this);

		this.subscriptions = [];
		this.canvasDrawCallbackList = [];
		this.panHappened = false;

		this.state = {
			focus: false,
			currentItem: {},
			show: false,
			mouseXY: [0, 0],
			panInProgress: false,
			interactiveState: [],
			currentCharts: [],
			receivedProps: 0,
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

		var { plotData, fullData, showingInterval, padding, direction } = nextProps;
		var { xScale, xAccessor, dimensions, children, postCalculator, dataAltered } = nextProps;

		var reset = !shallowEqual(this.props.plotData, nextProps.plotData);

		var newState;
		if (reset) {
			if (process.env.NODE_ENV !== "production") {
				console.log("DATA VIEW PORT CHANGED - CHART RESET");
			}

			plotData = postCalculator(plotData);

			let chartConfig = getChartConfigWithUpdatedYScales(getNewChartConfig(dimensions, children), plotData);

			newState = {
				showingInterval,
				xScale: setXRange(xScale, dimensions, padding, direction),
				plotData,
				chartConfig,
			};
		} else if (dataAltered
				&& isLastItemVisible(this.props.fullData, this.state.plotData)) {

			if (process.env.NODE_ENV !== "production") {
				console.log("DATA CHANGED AND LAST ITEM VISIBLE");
			}
			// if last item was visible, then shift
			var updatedXScale = setXRange(this.state.xScale.copy(), dimensions, padding, direction);

			var [start, end] = this.state.xScale.domain();
			var l = last(isDefined(showingInterval) ? fullData[showingInterval] : fullData);
			if (end >= xAccessor(l)) {
				// get plotData between [start, end] and do not change the domain
				plotData = getDataBetween(fullData, showingInterval, xAccessor, start, end);
			} else {
				// get plotData between [xAccessor(l) - (end - start), xAccessor(l)] and DO change the domain
				var dx = updatedXScale(xAccessor(l)) - updatedXScale.range()[1];
				var [newStart, newEnd] = updatedXScale.range().map(x => x + dx).map(updatedXScale.invert);

				plotData = getDataBetween(fullData, showingInterval, xAccessor, newStart, newEnd);

				if (updatedXScale.isPolyLinear && updatedXScale.isPolyLinear() && updatedXScale.data) {
					updatedXScale.data(plotData);
				} else {
					updatedXScale.domain(newStart, newEnd);
				}
			}
			// plotData = getDataOfLength(fullData, showingInterval, plotData.length)
			let chartConfig = getChartConfigWithUpdatedYScales(getNewChartConfig(dimensions, children), plotData);

			newState = {
				xScale: updatedXScale,
				chartConfig,
				plotData,
			};
		} else {
			console.log("TRIVIAL CHANGE");
			// this.state.plotData or plotData
			let chartConfig = getChartConfigWithUpdatedYScales(
				getNewChartConfig(dimensions, children), this.state.plotData);

			newState = {
				xScale: setXRange(this.state.xScale.copy(), dimensions, padding, direction),
				chartConfig,
			};
		}

		if (isDefined(newState)) {
			if (!this.state.panInProgress) {
				this.clearBothCanvas(nextProps);
				this.clearInteractiveCanvas(nextProps);
				this.clearCanvasDrawCallbackList();
			}
			this.setState({
				...newState,
				receivedProps: this.state.receivedProps + 1,
			});
		}
	}

	shouldComponentUpdate(nextProps, nextState) {
		return !(this.state.receivedProps < nextState.receivedProps
					&& this.props.type === "hybrid"
					&& this.state.panInProgress)
				&& !(this.state.panInProgress
					&& this.props.type === "hybrid"
					&& this.state.show !== nextState.show
					&& this.state.receivedPropsOnPanStart < nextState.receivedProps
					&& this.state.receivedProps === nextState.receivedProps);
	}

	clearBothCanvas(props) {
		props = props || this.props;
		var canvases = props.canvasContexts();
		if (canvases && canvases.axes) {
			// console.log("CLEAR");
			clearCanvas([canvases.axes, canvases.mouseCoord]);
		}
	}

	clearInteractiveCanvas(props) {
		props = props || this.props;
		var canvases = props.canvasContexts();
		if (canvases && canvases.interactive) {
			// console.error("CLEAR");
			clearCanvas([canvases.interactive]);
		}
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

	getAllCanvasDrawCallback() {
		return this.canvasDrawCallbackList;
	}

	handleZoom(zoomDirection, mouseXY) {
		// console.log("zoomDirection ", zoomDirection, " mouseXY ", mouseXY);
		var { plotData, showingInterval, xScale: initialXScale, chartConfig: initialChartConfig, currentItem } = this.state;
		var { xAccessor, fullData, interval, dimensions: { width }, xExtentsCalculator, postCalculator } = this.props;

		var item = getCurrentItem(initialXScale, xAccessor, mouseXY, plotData),
			cx = initialXScale(xAccessor(item)),
			c = zoomDirection > 0 ? 2 : 0.5,
			newDomain = initialXScale.range().map(x => cx + (x - cx) * c).map(initialXScale.invert);

		var { plotData, interval: updatedInterval, scale: updatedScale } = xExtentsCalculator
			.data(fullData)
			.width(width)
			.scale(initialXScale)
			.currentInterval(showingInterval)
			.currentDomain(initialXScale.domain())
			.currentPlotData(plotData)
			.interval(interval)(newDomain, xAccessor);

		plotData = postCalculator(plotData);
		var currentItem = getCurrentItem(updatedScale, xAccessor, mouseXY, plotData);
		var chartConfig = getChartConfigWithUpdatedYScales(initialChartConfig, plotData);
		var currentCharts = getCurrentCharts(chartConfig, mouseXY);
		this.clearBothCanvas();
		this.clearInteractiveCanvas();

		// console.log(showingInterval, updatedInterval);
		this.clearCanvasDrawCallbackList();
		this.setState({
			xScale: updatedScale,
			showingInterval: updatedInterval,
			plotData,
			mouseXY,
			currentCharts,
			chartConfig,
			currentItem,
		});/**/
	}

	handleMouseMove(mouseXY, inputType, e) {
		var {
			chartConfig, plotData, xScale
		} = this.state;
		var {
			xAccessor
		} = this.props;

		var currentCharts = getCurrentCharts(chartConfig, mouseXY);

		var currentItem = getCurrentItem(xScale, xAccessor, mouseXY, plotData);
		// optimization oportunity do not change currentItem if it is not the same as prev

		var interactiveState = inputType === "mouse" ? this.triggerCallback(
			"mousemove", {...this.state, currentItem, currentCharts
			},
			this.state.interactiveState,
			e) : this.triggerCallback(
			"touch", {...this.state, currentItem, currentCharts
			},
			this.state.interactiveState,
			e);

		var contexts = this.getCanvasContexts();
		if (contexts && contexts.mouseCoord) {
			clearCanvas([contexts.mouseCoord]);
			this.clearInteractiveCanvas();
		}
		// console.log(interactiveState === this.state.interactiveState);
		// if (interactiveState !== this.state.interactiveState) this.clearInteractiveCanvas();

		this.setState({
			mouseXY,
			currentItem,
			currentCharts,
			interactiveState,
		});
	}

	handleMouseEnter() {
		this.setState({
			show: true,
		});
	}

	handleMouseLeave() {
		var contexts = this.getCanvasContexts();

		this.clearInteractiveCanvas();

		if (contexts && contexts.mouseCoord) {
			this.clearCanvas([contexts.mouseCoord]);
		}

		this.setState({
			show: false
		});
	}

	handlePanStart(panStartDomain, panOrigin, dxy) {
		// console.log("panStartDomain - ", panStartDomain, ", panOrigin - ", panOrigin);
		this.setState({
			panInProgress: true,
			panStartXScale: this.state.xScale,
			panOrigin: panOrigin,
			focus: true,
			deltaXY: dxy,
			receivedPropsOnPanStart: this.state.receivedProps,
		});
		this.panHappened = false;
	}

	panHelper(mouseXY) {
		var { panStartXScale: initialXScale, chartConfig: initialChartConfig } = this.state;
		var { showingInterval, panOrigin } = this.state;
		var { xAccessor, dimensions: { width }, fullData, xExtentsCalculator, postCalculator } = this.props;

		var dx = mouseXY[0] - panOrigin[0];

		if (isNotDefined(initialXScale.invert))
			throw new Error("xScale provided does not have an invert() method."
				+ "You are likely using an ordinal scale. This scale does not support zoom, pan");
		var newDomain = initialXScale.range().map(x => x - dx).map(initialXScale.invert);

		var { plotData, /* interval: updatedInterval,*/scale: updatedScale } = xExtentsCalculator
			.data(fullData)
			.width(width)
			.scale(initialXScale)
			.currentInterval(showingInterval)
			.currentDomain(this.hackyWayToStopPanBeyondBounds__domain)
			.currentPlotData(this.hackyWayToStopPanBeyondBounds__plotData)
			.interval(showingInterval)(newDomain, xAccessor);

		plotData = postCalculator(plotData);
		// console.log(last(plotData));
		var currentItem = getCurrentItem(updatedScale, xAccessor, mouseXY, plotData);
		var chartConfig = getChartConfigWithUpdatedYScales(initialChartConfig, plotData);
		var currentCharts = getCurrentCharts(chartConfig, mouseXY);

		return {
			xScale: updatedScale,
			plotData,
			mouseXY,
			currentCharts,
			chartConfig,
			currentItem,
		};

	}

	handlePan(mousePosition) {
		this.panHappened = true;
		var state = this.panHelper(mousePosition);

		this.hackyWayToStopPanBeyondBounds__plotData = state.plotData;
		this.hackyWayToStopPanBeyondBounds__domain = state.xScale.domain();

		if (this.props.type !== "svg") {
			var { axes: axesCanvasContext, mouseCoord: mouseContext } = this.getCanvasContexts();
			var { mouseXY, chartConfig, plotData, currentItem, xScale, currentCharts } = state;
			var { show } = this.state;
			var { canvasDrawCallbackList } = this;

			requestAnimationFrame(() => {
				// this.clearCanvas([axesCanvasContext, mouseContext]);
				// this.clearCanvas([axesCanvasContext, mouseContext]);
				this.clearBothCanvas();
				this.clearInteractiveCanvas();

				// console.log(canvasDrawCallbackList.length)

				chartConfig.forEach(eachChart => {
					canvasDrawCallbackList
						.filter(each => eachChart.id === each.chartId)
						.forEach(each => {
							var { yScale } = eachChart;

							if (each.type === "axis") {
								each.draw(axesCanvasContext, xScale, yScale);
							} else if (each.type === "currentcoordinate") {
								each.draw(mouseContext, show, xScale, yScale, currentItem);
							} else if (each.type !== "interactive") {
								each.draw(axesCanvasContext, xScale, yScale, plotData);
							}
						});

				});
				this.drawInteractive(state);
				canvasDrawCallbackList
					.filter(each => isNotDefined(each.chartId))
					.filter(each => each.type === "axis")
					.forEach(each => each.draw(axesCanvasContext, chartConfig));

				canvasDrawCallbackList
					.filter(each => each.type === "mouse")
					.forEach(each => each.draw(mouseContext, show,
						xScale, mouseXY, currentCharts, chartConfig, currentItem));

			});
		} else {
			this.setState(state);
		}
	}

	handlePanEnd(mousePosition, e) {
		var state = this.panHelper(mousePosition);
		// console.log(this.canvasDrawCallbackList.map(d => d.type));
		this.hackyWayToStopPanBeyondBounds__plotData = null;
		this.hackyWayToStopPanBeyondBounds__domain = null;

		this.clearCanvasDrawCallbackList();

		var { interactiveState, callbackList } = this.panHappened
			? this.triggerCallback("panend", state, this.state.interactiveState, e)
			: this.triggerCallback("click", state, this.state.interactiveState, e);

		this.clearBothCanvas();
		if (interactiveState !== this.state.interactive) this.clearInteractiveCanvas();

		// console.log(interactiveState[0].interactive);
		this.setState({
			...state,
			show: this.state.show,
			panInProgress: false,
			panStartXScale: null,
			interactiveState,
		}, () => {
			if (isDefined(callbackList)) callbackList.forEach(callback => callback());
		});
	}

	clearCanvasDrawCallbackList() {
		this.canvasDrawCallbackList = [];
	}

	triggerCallback(eventType, state, interactiveState, event) {
		var {
			currentCharts, chartConfig
		} = state;
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

		var i = 0,
			j = 0,
			added = false;
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

	handleFocus(focus) {
		// console.log(focus);interactive
		this.setState({
			focus: focus,
		});
	}

	render() {
		return (
			<g>{this.props.children}</g>
		);
	}
}
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

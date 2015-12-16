"use strict";

import React from "react";
import PureComponent from "./utils/PureComponent";
import ChartDataUtil from "./utils/ChartDataUtil";
import DummyTransformer from "./transforms";

import objectAssign from "object-assign";

class EventHandler extends PureComponent {
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
		var { props, context } = this;
		var { initialDisplay, rawData, defaultDataTransform, dataTransform, interval, dimensions } = props;

		var transformedData = this.getTransformedData(rawData, defaultDataTransform, dataTransform, interval);

		var { data, options } = transformedData;

		var dataForInterval = data[interval];

		var mainChart = ChartDataUtil.getMainChart(props.children);
		var beginIndex = Math.max(dataForInterval.length - initialDisplay, 0);
		var plotData = dataForInterval.slice(beginIndex); // Main Data After the beginIndex.
		var chartData = ChartDataUtil.getChartData(props, dimensions, plotData, data, options);
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
	render() {
		var children = React.Children.map(this.props.children, (child) => {
			var newChild = Utils.isReactVersion13()
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

export default EventHandler;

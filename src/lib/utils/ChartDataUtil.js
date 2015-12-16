"use strict";

import React from "react";
import d3 from "d3";
import Utils from "./utils"

var { pluck } = Utils;

var ChartDataUtil = {
	getCharts(props) {
		return this.getChildren(props.children, /Chart$/);
	},
	getChartData(props, innerDimensions, partialData, fullData, other, domainL, domainR) {
		var charts = this.getCharts(props);

		return charts.map( (each) => {
			var chartProps = each.props;
			var config = this.getChartConfigFor(innerDimensions, chartProps, partialData, fullData, other);

			var plot = this.getChartPlotFor(config, partialData, domainL, domainR);

			return {
				id: each.props.id,
				config: config,
				plot: plot,
			};
		});
	},
	getChildren(children, regex) {
		var matchingChildren = [];
		React.Children.forEach(children, (child) => {
			if(React.isValidElement(child) && regex.test(child.props.namespace)) matchingChildren.push(child);
		});
		return matchingChildren;
	},
	getMainChart(children) {
		var eventCapture = this.getChildren(children, /EventCapture$/);
		if (eventCapture.length > 1) throw new Error("only one EventCapture allowed");
		if (eventCapture.length > 0) return eventCapture[0].props.mainChart;
		if (eventCapture.length == 0) return this.getChildren(children, /Chart$/)[0].props.id;
	},
	getDimensions(innerDimension, chartProps) {
		var availableWidth = innerDimension.width;
		var availableHeight = innerDimension.height;

		var fullWidth = (chartProps.width || availableWidth);
		var fullHeight = (chartProps.height || availableHeight);

		return {
			availableWidth: availableWidth,
			availableHeight: availableHeight,
			width: fullWidth,
			height: fullHeight
		};
	},
	getChartConfigFor(innerDimension, chartProps, partialData, fullData, passThroughProps) {
		var { padding, margin } = chartProps;
		var dimensions = this.getDimensions(innerDimension, chartProps);

		var xAccessor = this.getXAccessor(chartProps, passThroughProps);
		var overlaysToAdd = this.identifyOverlaysToAdd(chartProps);
		var compareBase = this.identifyCompareBase(chartProps);
		var compareSeries = this.identifyCompareSeries(chartProps);

		//Calculate overlays TODO

		var origin = typeof chartProps.origin === "function"
			? chartProps.origin(dimensions.availableWidth, dimensions.availableHeight)
			: chartProps.origin;

		var scales = this.defineScales(chartProps, partialData, passThroughProps);

		//TODO: IndicatorWithTicks

		var config = {
			width: dimensions.width,
			height: dimensions.height,
			mouseCoordinates: {
				at: chartProps.yMousePointerDisplayLocation,
				format: chartProps.yMousePointerDisplayFormat
			},
			// indicator: indicator,
			// indicatorOptions: indicator && indicator.options(),
			// domain: indicator && indicator.domain && indicator.domain(),
			origin: origin,
			padding: padding,
			xAccessor: xAccessor,
			overlays: overlaysToAdd,
			compareBase: compareBase,
			compareSeries: compareSeries,
			scaleType: scales,
			// yTicks: yTicks,
		};
		return config;
	},
	getXAccessor(props, passThroughProps) {
		var xAccessor = passThroughProps !== undefined && passThroughProps.xAccessor
			|| props.xAccessor !== undefined && props.xAccessor;
		return xAccessor;
	},
	identifyOverlaysToAdd(chartProps) {
		var overlaysToAdd = [];
		return overlaysToAdd;
	},
	identifyCompareBase(props) {
		var compareBase;
		React.Children.forEach(props.children, (child) => {
			if(React.isValidElement(child) && /DataSeries$/.test(child.props.namespace)) {
				compareBase = child.props.compareBase;
			}
		});
		return compareBase;
	},
	identifyCompareSeries(props) {
		var overlaysToAdd = [];
		return overlaysToAdd;
	},
	defineScales(props, data, passThroughProps) {
		var xScale = props.xScale,
			yScale = props.yScale;

		if (xScale === undefined && passThroughProps) xScale = passThroughProps.xScale;

		if (xScale === undefined) {
			var each = data[0];
			if (typeof each === "object") {
				Object.keys(each).forEach( (key) => {
					if (Object.prototype.toString.call(each[key]) === "[object Date]") {
						xScale = d3.time.scale();
					}
				});
			}
			if(xScale === undefined) xScale = d3.scale.linear();
		}
		if (yScale === undefined) {
			yScale = d3.scale.linear();
		}
		return { xScale: xScale, yScale: yScale };
	},
};

module.exports = ChartDataUtil;

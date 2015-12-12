"use strict";

import React from "react";
import d3 from "d3";

var ChartDataUtil = {
	getCharts(props) {
		return this.getChildren(props.children, /Chart$/);
	},
	getChartData(props, innerDimensions, partialData, fullData, other, domainL, domainR) {
		var charts = this.getCharts(props);

		return charts.map( (each) => {
			var chartProps = each.props;
			var config = this.getChartConfigFor(innerDimensions, chartProps, partialData, fullData, other);
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
	},
};

module.exports = ChartDataUtil;

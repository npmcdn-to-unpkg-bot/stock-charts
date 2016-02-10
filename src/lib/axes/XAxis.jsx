"use strict";

import React from "react";

import PureComponent from "../utils/PureComponent";

class XAxis extends PureComponent {
	render() {
		var { axisAt, showTicks, tickFormat, ticks } = this.props;
		return (
			<div></div>
		);
	}
}

XAxis.defaultProps = {
	//namespace: "ReStock.XAxis", TODO: Why should we need namespace here
	showGrid: false,
	showTicks: true,
	className: "react-stockcharts-x-axis", // TODO: Why className Here
	ticks: 10,
};

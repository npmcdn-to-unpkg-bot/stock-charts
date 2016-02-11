"use strict";

import React from "react";
import d3 from "d3";

import ReStock from "react-stockcharts";

var {ChartCanvas, Chart} = ReStock;
var { fitWidth } = ReStock.helper;

export class CandleStickChart extends React.Component {
	render() {
		var { type, width, data } = this.props;
		return (
			<ChartCanvas width={width} height={400}
				margin={{left: 50, right: 50, top:10, bottom: 30}}
				data={data.slice(0, 150)} type={type} >
				<Chart id={1} xAccessor={(d) => d.date}>

				</Chart>
			</ChartCanvas>
		);
	}
}

CandleStickChart.propTypes = {
	data: React.PropTypes.array.isRequired,
	width: React.PropTypes.number.isRequired,
	type: React.PropTypes.oneOf(["svg", "hybrid"]).isRequired,
};

CandleStickChart.defaultProps = {
	type: "svg",
};

CandleStickChart = fitWidth(CandleStickChart);

export default CandleStickChart;


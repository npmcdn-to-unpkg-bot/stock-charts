"use strict";

import React from "react";
import d3 from "d3";

import ReStock from "react-stockcharts";

var { ChartCanvas, Chart, DataSeries, EventCapture } = ReStock;

var { AreaSeries } = ReStock.series;

var { MouseCoordinates } = ReStock.coordinates;

var { StockscaleTransformer } = ReStock.transforms;
var { XAxis, YAxis } = ReStock.axes;

var { fitWidth } = ReStock.helper;

class AreaChartWithEdge extends React.Component {
	render() {
		var { data, type, width } = this.props;

		return (
			<ChartCanvas width={width} height={400}
				margin={{left: 90, right: 70, top:10, bottom: 30}} initialDisplay={300}
				dataTransform={[ { transform: StockscaleTransformer } ]}
				data={data} type={type}>
				<Chart id={1} yMousePointerDisplayLocation="right" yMousePointerDisplayFormat={(y) => y.toFixed(2)}>
					<XAxis axisAt="bottom" orient="bottom"/>
					<YAxis axisAt="right" orient="right" ticks={5} />
					<DataSeries id={0} yAccessor={AreaSeries.yAccessor} stroke="#76C444" fill="#C7F3AB">
						<AreaSeries />
					</DataSeries>
				</Chart>
				<MouseCoordinates xDisplayFormat={d3.time.format("%Y-%m-%d")} />
				<EventCapture mouseMove={true} zoom={true} pan={true} mainChart={1} defaultFocus={false} />
			</ChartCanvas>
		);
	}
}

AreaChartWithEdge.propTypes = {
	data: React.PropTypes.array.isRequired,
	width: React.PropTypes.number.isRequired,
	type: React.PropTypes.oneOf(["svg", "hybrid"]).isRequired,
};

AreaChartWithEdge.defaultProps = {
	type: "svg",
};
AreaChartWithEdge = fitWidth(AreaChartWithEdge);

export default AreaChartWithEdge;

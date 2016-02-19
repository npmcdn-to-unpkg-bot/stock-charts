"use strict";

import React from 'react';

class CandlestickSeries extends React.Component {
	render() {
		var { className, wickClassName, candleClassName } = this.props;
		return <g className={className}>
		</g>
	}
}

CandlestickSeries.defaultProps = {
	className: "react-stockcharts-candlestick",
	wickClassName: "react-stockcharts-candlestick-wick",
	candleClassName: "react-stockcharts-candlestick-candle",
	classNames: {
		up: "up",
		down: "down"
	},
	widthRatio: 0.5,
	stroke: {
		up: "none",
		down: "none"
	},
	wickStrokeStroke: {
		up: "#000000", // "#6BA583"
		down: "#000000" // "red"
	},
	fill: {
		up: "#6BA583",
		down: "#FF0000"
	},
	opacity: 1,
};

CandlestickSeries.yAccessor = (d) => ({ open: d.open, high: d.high, low: d.low, close: d.close }); //Returning an object when used with round brackets

CandlestickSeries.getWicksSVG = (props) => {
	/*var {}*/
};

CandlestickSeries.getCandleData = (props, xAccessor, yAccessor, xScale, yScale, compareSeries, plotData) => {
	var candles = plotData
			.filter((d) => d.close !== undefined)
			.map();
};

export default CandlestickSeries;

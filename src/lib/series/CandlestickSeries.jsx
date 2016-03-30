"use strict";

import React from 'react';
import wrap from "./wrap";

import { isDefined } from '../utils/utils';

class CandlestickSeries extends React.Component {
	render() {
		var { className, wickClassName, candleClassName } = this.props;
		return <g className={className}>
			<g className={wickClassName} key="wicks">
				{CandlestickSeries.getWicksSVG(this.props)}
			</g>
		</g>
	}
}

CandlestickSeries.defaultProps = {
	className: "react-stockcharts-candlestick",
	wickClassName: "react-stockcharts-candlestick-wick",
	candleClassName: "react-stockcharts-candlestick-candle",
	yAccessor: d => ({ open: d.open, high: d.high, low: d.low, close: d.close }),
	classNames: d => d.close > d.open ? "up" : "down",
	widthRatio: 0.5,
	stroke: "none",
	wickStroke: "#000000",
	fill: d => d.close > d.open ? "#6BA583" : "#FF0000",
	opacity: 1,
};

CandlestickSeries.yAccessor = (d) => ({ open: d.open, high: d.high, low: d.low, close: d.close }); //Returning an object when used with round brackets

CandlestickSeries.getWicksSVG = (props) => {

	var { xAccessor, yAccessor, xScale, yScale, plotData } = props;
	var wickData = CandlestickSeries.getWickData(props, xAccessor, yAccessor, xScale, yScale, plotData);
	var wicks = wickData
			.map((d, idx) => <line key={idx}
				className={d.className} stroke={d.stroke} style={{ shapeRendering: "crispEdges"}}
				x1={d.x1} y1={d.y1}
				x2={d.x2} y2={d.y2} />
			);
};

CandlestickSeries.getCandleData = (props, xAccessor, yAccessor, xScale, yScale, compareSeries, plotData) => {
	var candles = plotData
			.filter((d) => d.close !== undefined)
			.map();
};

CandlestickSeries.getWickData = ( props, xAccessor, yAccessor, xScale, yScale, plotData ) => {

	var {classNames: classNameProp, wickStroke: wickStrokeProp } = props;
	var wickStroke = d3.functor(wickStrokeProp);
	var className = d3.functor(classNameProp);
	var wickData = plotData
			.filter( d => isDefined(d.close))
			.map(d => {
				var ohlc = yAccessor(d);

				var x1 = Math.round(xScale(xAccessor(d))),
					y1 = yScale(ohlc.high),
					x2 = x1,
					y2 = xScale(ohlc.low);

				return {
					x1: x1,
					y1: y1,
					x2: x2,
					y2: y2,
					className: className(ohlc),
					direction: (ohlc.close - ohlc.open),
					stroke: wickStroke(ohlc),
				};
			});
	return wickData
};

export default wrap(CandlestickSeries);

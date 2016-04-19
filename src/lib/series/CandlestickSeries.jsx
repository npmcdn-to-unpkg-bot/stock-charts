"use strict";

import React, { PropTypes, Component } from "react";
import wrap from "./wrap";

import { first, last, hexToRGBA, isDefined } from "../utils";

class CandlestickSeries extends React.Component {
	render() {
		var { className, wickClassName, candleClassName } = this.props;
		return <g className={className}>
			<g className={wickClassName} key="wicks">
				{CandlestickSeries.getWicksSVG(this.props)}
			</g>
			<g className={candleClassName} key="candles">
				{CandlestickSeries.getCandlesSVG(this.props)}
			</g>
		</g>;
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

CandlestickSeries.getWicksSVG = (props) => {

	var { xAccessor, yAccessor, xScale, yScale, plotData } = props;
	var wickData = CandlestickSeries.getWickData(props, xAccessor, yAccessor, xScale, yScale, plotData);
	var wicks = wickData
			.map((d, idx) => <line key={idx}
				className={d.className} stroke={d.stroke} style={{ shapeRendering: "crispEdges"}}
				x1={d.x1} y1={d.y1}
				x2={d.x2} y2={d.y2} />
			);
	return wicks;
};

CandlestickSeries.getCandlesSVG = (props) => {
	var { xAccessor, yAccessor, xScale, yScale, plotData, opacity } = props;

	var candleData = CandlestickSeries.getCandleData(props, xAccessor, yAccessor, xScale, yScale, plotData);

	var candles = candleData.map((d, idx) => {
		if (d.width < 0)
			return (
				<line className={d.className} key={idx}
					x1={d.x} y1={d.y} x2={d.x} y2={d.y + d.height}
					stroke={d.fill} />
			);
		else if (d.height === 0)
			return (
				<line key={idx}
					x1={d.x} y1={d.y} x2={d.x + d.width} y2={d.y + d.height}
					stroke={d.fill} />
			);
		return (
			<rect key={idx} className={d.className}
				fillOpacity={opacity}
				x={d.x} y={d.y} width={d.width} height={d.height}
				fill={d.fill} stroke={d.stroke} />
		);
	});
	return candles;
};

CandlestickSeries.getCandleData = (props, xAccessor, yAccessor, xScale, yScale, plotData) => {
	var { classNames, fill: fillProp, stroke: strokeProp, widthRatio } = props;
	var fill = d3.functor(fillProp);
	var stroke = d3.functor(strokeProp);

	var width = xScale(xAccessor(last(plotData))) - xScale(xAccessor(first(plotData)));
	var cw = (width / (plotData.length - 1)) * widthRatio;
	var candleWidth = Math.round(cw);
	var offset = (candleWidth === 1 ? 0 : 0.5 * candleWidth);
	var candles = plotData
			.filter(d => isDefined(d.close))
			.map(d => {
				var ohlc = yAccessor(d);
				var x = Math.round(xScale(xAccessor(d))) - offset,
					y = yScale(Math.max(ohlc.open, ohlc.close)),
					height = Math.abs(yScale(ohlc.open) - yScale(ohlc.close)),
					className = (ohlc.open <= ohlc.close) ? classNames.up : classNames.down;
				return {
					x: x,
					y: y,
					height: height,
					width: candleWidth,
					className: className,
					fill: fill(ohlc),
					stroke: stroke(ohlc),
					direction: (ohlc.close - ohlc.open),
				};
			});
	return candles;
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
					y2 = yScale(ohlc.low);

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

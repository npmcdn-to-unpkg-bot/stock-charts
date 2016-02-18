"use strict";

import React from 'react';
import objectAssign	from 'object-assign';

import { hexToRGBA } from '../utils/utils';

function d3_identity(d) {
	return d;
}

function tickTransform_svg_axisX(scale, tick) {
	return [ ~~ (0.5 + scale(tick)), 0]; // Why the uniary operators here.
}

function tickTransform_svg_axisY(scale, tick) {
	return [0, ~~ (0.5 + scale(tick))];
}

class Tick extends React.Component {
	  render() {
		  	return (
		  		<div></div>
		  	);
	  }
}

Tick.propTypes = {
	transform: React.PropTypes.arrayOf(Number),
	tickStroke: React.PropTypes.string,
	tickStrokeOpacity: React.PropTypes.number,
	textAnchor: React.PropTypes.string,
	fontSize: React.PropTypes.number,
	fontFamily: React.PropTypes.string,
	x: React.PropTypes.number,
	y: React.PropTypes.number,
	x2: React.PropTypes.number,
	y2: React.PropTypes.number,
	dy: React.PropTypes.string,
	children: React.PropTypes.node.isRequired,
};

Tick.drawOnCanvasStatic	= (tick, ctx, chartData, result) => {
	var { scale, tickTransform, canvas_dy, x, y, x2, y2, format } = result;

	var origin = tickTransform(scale, tick);

	ctx.beginPath();

	ctx.moveTo(origin[0], origin[1]);
	ctx.lineTo(origin[0] + x2, origin[1] + y2);
	ctx.stroke();

	ctx.fillText(format(tick), origin[0] + x, origin[1] + y + canvas_dy);
};

class AxisTicks extends React.Component {
	render() {
		return (
			<div></div>
		);
	}
}

AxisTicks.defaultProps = {
	innerTickSize: 5,
	tickPadding: 6,
	ticks: [10],
	tickStroke: "#000",
	tickStrokeOpacity: 1,
};

AxisTicks.helper = (props, scale) => {

	var { orient, innerTickSize, tickFormat, tickPadding, fontSize, fontFamily } = props;

	var { ticks: tickArguments, tickValues, tickStroke, tickStrokeOpacity } = props;

	var ticks = tickValues === undefined
			? (scale.ticks
				? scale.ticks.apply(scale, tickArguments)
				: scale.domain())
			: tickValues;

	var format = tickFormat === undefined
			? (scale.tickFormat
				? scale.tickFormat.apply(scale, tickArguments)
				: d3_identity)
			: tickFormat;

	var sign = orient === "top" || orient === "left" ? -1 : 1;
	var tickSpacing = Math.max(innerTickSize, 0) + tickPadding;

	var tickTransform, x, y, x2, y2, dy, canvas_dy, textAnchor;

	if (orient === "bottom" || orient === "top") {
		tickTransform = tickTransform_svg_axisX;
		x2 = 0;
		y2 = sign * innerTickSize;
		x = 0;
		y = sign * tickSpacing;
		dy = sign < 0 ? "0em" : ".71em";
		canvas_dy = sign < 0 ? 0 : (fontSize * .71);
		textAnchor = "middle";
	} else {
		tickTransform = tickTransform_svg_axisY;
		x2 = sign * innerTickSize;
		y2 = 0;
		x = sign * tickSpacing;
		y = 0;
		dy = ".32em";
		canvas_dy = (fontSize * .32);
		textAnchor = sign < 0 ? "end" : "start";
	}
	return { ticks, scale, tickTransform, tickStroke, tickStrokeOpacity, dy, canvas_dy, x, y, x2, y2, textAnchor, fontSize, fontFamily, format };
};

AxisTicks.drawOnCanvasStatic = (props, ctx, chartData, xScale, yScale) => {
	props = objectAssign({}, AxisTicks.defaultProps, props);

	var { orient } = props;
	var xAxis = (orient === "bottom" || orient === "top");

	var result = AxisTicks.helper(props, xAxis ? xScale : yScale);

	var { tickStroke, tickStrokeOpacity, textAnchor, fontSize, fontFamily } = result;

	ctx.strokeStyle = hexToRGBA(tickStroke, tickStrokeOpacity);

	ctx.font = `${ fontSize }px ${ fontFamily }`;
	ctx.fillStyle = tickStroke;
	ctx.textAlign = textAnchor === "middle" ? "center" : textAnchor;

	result.ticks.forEach((tick) => {
		Tick.drawOnCanvasStatic(tick, ctx, chartData, result);
	});
};

export default AxisTicks;

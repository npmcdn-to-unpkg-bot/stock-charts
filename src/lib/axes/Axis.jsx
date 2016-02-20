"use strict";

import React from 'react';

import AxisTicks from "./AxisTicks";
import AxisLine from "./AxisLine";

class Axis extends React.Component {
	constructor(props) {
		super(props);
		this.drawOnCanvas = this.drawOnCanvas.bind(this);
	}
	componentWillMount() {
		this.componentWillReceiveProps(this.props, this.context);
	}
	componentWillReceiveProps(nextProps, nextContext) {
		var { margin, chartId, canvasOriginX, canvasOriginY } = nextContext;
		var draw = Axis.drawOnCanvasStatic.bind(null, margin, nextProps, [canvasOriginX, canvasOriginY]);

		/*nextContext.callbackForCanvasDraw({
			chartId: chartId,
			type: "axis",
			draw: draw,
		});*/
	}
	componentDidMount() {
		if (this.context.chartCanvasType !== "svg" && this.context.getCanvasContexts !== undefined) {
			var contexts = this.context.getCanvasContexts();
			if (contexts) this.drawOnCanvas(contexts.axes);
		}
	}
	componentDidUpdate() {
		this.componentDidMount();
	}
	drawOnCanvas(ctx) {
		var { chartData, margin, canvasOriginX, canvasOriginY } = this.context;
		var { scale } = this.props;

		Axis.drawOnCanvasStatic(margin, this.props, [canvasOriginX, canvasOriginY], ctx, chartData, scale, scale);
	}
	render() {
		if (this.context.chartCanvasType !== "svg") return null;
		return (
			<div></div>
		);
	}
}

Axis.contextTypes = {
	getCanvasContexts: React.PropTypes.func,
	chartCanvasType: React.PropTypes.string,
	chartData: React.PropTypes.object.isRequired,
	chartId: React.PropTypes.number.isRequired,
	margin: React.PropTypes.object.isRequired,
	canvasOriginX: React.PropTypes.number,
	canvasOriginY: React.PropTypes.number,
	// secretToSuperFastCanvasDraw: React.PropTypes.array.isRequired,
	callbackForCanvasDraw: React.PropTypes.func.isRequired,
};

Axis.defaultProps = {
	defaultClassName: "react-stockcharts-axis ",
	showDomain: true,
	showTicks: true,
	fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
	fontSize: 12,
};

Axis.drawOnCanvasStatic = (margin, props, canvasOrigin, ctx, chartData, xScale, yScale) => {
		var { transform, showDomain, showTicks } = props;
		ctx.save(); // Saving the state so that we retain the initial state.

		ctx.setTransform(1, 0, 0, 1, 0, 0); //Why??
		ctx.translate(canvasOrigin[0] + transform[0], canvasOrigin[1] + transform[1]);

		if (showDomain) AxisLine.drawOnCanvasStatic(props, ctx, chartData, xScale, yScale);
		if (showTicks) AxisTicks.drawOnCanvasStatic(props, ctx, chartData, xScale, yScale);

		ctx.restore();
};

export default Axis;

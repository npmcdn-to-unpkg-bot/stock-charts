"use strict";

import React, { PropTypes, Component } from "react";
import { identity, isDefined, isNotDefined } from "./utils";

import eodIntervalCalculator from "./scale/eodIntervalCalculator";

import EventHandler from "./EventHandler";
import CanvasContainer from "./CanvasContainer";

import evaluator from "./scale/evaluator";

function calculateFullData(props) {
	var { data, calculator } = props;
	var { xScale, intervalCalculator, allowedIntervals, plotFull } = props;
	var { xAccessor, map, dataEvaluator, indexAccessor, indexMutator, discontinous } = props;

	var wholeData = isDefined(plotFull) ? plotFull : xAccessor === identity;

	var evaluate = dataEvaluator()
		.allowedIntervals(allowedIntervals)
		.intervalCalculator(intervalCalculator)
		.xAccessor(xAccessor)
		.discontinous(discontinous)
		.indexAccessor(indexAccessor)
		.indexMutator(indexMutator)
		.map(map)
		.useWholeData(wholeData)
		.scale(xScale)
		.calculator(calculator.slice());

		evaluate(data);
}

function calculateState(props) {
	var { data, interval, allowedIntervals } = props;
	var { xAccessor: inputXAccesor, xExtents: xExtentsProp, xScale } = props;

	if (isDefined(interval)
		&& (isNotDefined(allowedIntervals)
			|| allowedIntervals.indexOf(interval) > -1)) throw new Error("interval has to be part of allowedInterval");

	calculateFullData(props);


}

class ChartCanvas extends Component {
	constructor() {
		super();
		this.getCanvases = this.getCanvases.bind(this);
		this.getDataInfo = this.getDataInfo.bind(this);
	}
	getDataInfo() {
		return this.refs.chartContainer.getDataInfo();
	}
	getCanvases() {
		if ( this.refs && this.refs.canvases ) {
			return this.refs.canvases.getCanvasContexts();
		}
	}
	getChildContext() {
		return {
			displayXAccessor: this.props.xAccessor,
		};
	}
	componentWillMount() {
		this.setState(calculateState(this.props));
	}
	render() {
		var dimensions = this.getDimensions(this.props);
		var style = `<![CDATA[
						.react-stockcharts-grabbing-cursor {
							cursor: grabbing;
							cursor: -moz-grabbing;
							cursor: -webkit-grabbing;
						}
						.react-stockcharts-crosshair-cursor {
							cursor: crosshair;
						}
						.react-stockcharts-toottip-hover {
							pointer-events: all;
							cursor: pointer;
						}
					]]>`;
		var { data, dataTransform, interval, initialDisplay, type, height, width, margin, className, clip, zIndex } = this.props;

		return (
			<div style={{position: "relative", height: height, width: width}} className={className} >
				<CanvasContainer ref="canvases" width={width} height={height} type={this.props.type} zIndex={zIndex}/>
				<svg width={width} height={height} style={{ position: "absolute", zIndex: (zIndex + 5) }}>
					<style type="text/css" dangerouslySetInnerHTML={{ __html: style }}>
					</style>

					<defs>
						<clipPath id="chart-area-clip">
							<rect x="0" y="0" width={dimensions.width} height={dimensions.height} />
						</clipPath>
					</defs>
					<g transform={`translate(${margin.left + 0.5}, ${margin.top + 0.5})`}>
						<EventHandler ref="chartContainer"
								rawData={data} dataTransform={dataTransform} interval={interval}
								initialDisplay={initialDisplay}
								dimensions={dimensions} type={type} margin={margin} canvasContexts={this.getCanvases}>
								{this.props.children}
						</EventHandler>
					</g>
				</svg>
			</div>
		);
	}
}

ChartCanvas.propTypes = {
	width: React.PropTypes.number.isRequired,
	height: React.PropTypes.number.isRequired,
	margin: React.PropTypes.object,
	interval: React.PropTypes.oneOf(["D", "W", "M"]).isRequired, // ,"m1", "m5", "m15", "W", "M"
	type: React.PropTypes.oneOf(["svg", "hybrid"]).isRequired,
	data: React.PropTypes.array.isRequired,
	initialDisplay: React.PropTypes.number,
	dataTransform: React.PropTypes.array.isRequired,
	className: React.PropTypes.string,
	zIndex: React.PropTypes.number,
};

ChartCanvas.defaultProps = {
	margin: {top: 20, right: 30, bottom: 30, left: 80},
	type: "hybrid",
	calculator: [],
	dataEvaluator: evaluator,
	intervalCalculator: eodIntervalCalculator,
	xAccessor: identity,
	map: identity,
	dataTransform: [ ],
	className: "react-stockchart",
	zIndex: 1,
	// clip: true,
	// initialDisplay: 30
};

export default ChartCanvas;

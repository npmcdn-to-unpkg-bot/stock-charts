import React from "react";
import EdgeCoordinate from "./EdgeCoordinate";

class CrossHair extends React.Component {
	shouldComponentUpdate(nextProps) {
		return nextProps.mouseXY !== this.props.mouseXY;
	}

	render() {
		var result = CrossHair.helper(this.props);
		var { line, edges } = result;

		var svgLine = line !== undefined
			? <line className="react-stockcharts-cross-hair" opacity={line.opacity} stroke={line.stroke}
					x1={line.x1} y1={line.y1}
					x2={line.x2} y2={line.y2} />
			: null;

		return (
			<g className="crosshair">
				{svgLine}
				{edges.map((edge, idx) => <EdgeCoordinate
					key={idx}
					className="horizontal"
					{ ...edge }
					/>)}
			</g>
		);
	}
}

CrossHair.propTypes = {
	yAxisPad: React.PropTypes.number.isRequired,
	height: React.PropTypes.number.isRequired,
	width: React.PropTypes.number.isRequired,
	mouseXY: React.PropTypes.array.isRequired,
	xDisplayValue: React.PropTypes.string.isRequired,
	edges: React.PropTypes.array.isRequired
};

CrossHair.defaultProps = {
	namespace: "ReStock.CrossHair",
	yAxisPad: 5
};

CrossHair.helper = (props) => {
	var { width, edges, yAxisPad, mouseXY, xDisplayValue, height } = props;
	var { stroke, opacity, textStroke, textBGFill, textBGopacity, fontFamily, fontSize } = props;
	var x1 = 0, x2 = width;

	var edges = edges.map((edge) => {
		if (edge.at === "left") {
			x1 = -yAxisPad;
		}
		if (edge.at === "right") {
			x2 = width + yAxisPad;
		}

		return {
			type: "horizontal",
			show: true,
			x1: 0,
			y1: mouseXY[1],
			x2: 0,
			y2: mouseXY[1],
			coordinate: edge.yDisplayValue,
			edgeAt: (edge.at === "left" ? x1 : x2),
			orient: edge.at,
			hideLine: true,
			lineStroke: stroke,
			lineOpacity: opacity,
			textFill: textStroke,
			fill: textBGFill,
			opacity: textBGopacity,
			fontFamily, fontSize
		};
	});
	edges.push({
		type: "vertical",
		show: true,
		x1: mouseXY[0],
		y1: 0,
		x2: mouseXY[0],
		y2: height,
		coordinate: xDisplayValue,
		edgeAt: height,
		orient: "bottom",
		lineStroke: stroke,
		lineOpacity: opacity,
		textFill: textStroke,
		fill: textBGFill,
		opacity: textBGopacity,
		fontFamily, fontSize
	});

	var line;
	if (edges.length > 1) {
		line = {
			opacity: opacity,
			stroke: stroke,
			x1: x1,
			y1: mouseXY[1],
			x2: x2,
			y2: mouseXY[1],
		};
	}

	return { edges, line };
};


export default CrossHair;

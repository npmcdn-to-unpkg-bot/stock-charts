import React from 'react';

class CrossHair extends React.Component {

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
			</g>
		);
	}
}

CrossHair.defaultProps = {
	namespace: "ReStock.CrossHair",
	yAxisPad: 5
};

CrossHair.helper = (props) => {
	var { width, edges, yAxisPad, mouseXY } = props;
	var { stroke, opacity } = props;
	var x1 = 0, x2 = width;

	var edges = edges.map((edge) => {
		if (edge.at === "left") {
			x1 = -yAxisPad;
		}
		if (edge.at === "right") {
			x2 = width + yAxisPad
		}

		return {
			type: "horizontal"
			show: true,
		};
	});

	edges.push({
		type: "vertical"
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

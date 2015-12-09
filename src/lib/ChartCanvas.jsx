"use strict";

import React from "react";
import objectAssign from "object-assign";

import CanvasContainer

class ChartCanvas extends React.Component {
	getDimensions(props) {
		return {
			height: props.height - props.margin.top - props.margin.bottom,
			width: props.width - props.margin.left - props.margin.right,
		};
	}
	render() {
		var dimensions = this.getDimensions(this.props);
		var style = '<![CDATA[
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
					]]>';
		var { data, dataTransform, interval, initialDisplay, type, height, width, margin, className, clip, zIndex } = this.props;

		return (
			<div style={{position: "relative", height: height, width: width}} className={className} >
				<CanvasContainer ref="canvases" width={width} height={height} type={this.props.type} zIndex={zIndex}/>

			</div>
		);
	}
}

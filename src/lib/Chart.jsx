"use strict";

import React, { PropTypes } from "react";
import objectAssign from "object-assign";

import PureComponent from "./utils/PureComponent";
import { isReactVersion13 } from "./utils/utils";
import { getChartOrigin } from "./utils/ChartDataUtil";

class Chart extends PureComponent {
	getChildContext() {
		var { id: chartId } = this.props;
		var chartConfig = this.context.chartConfig.filter((each) => each.id === chartId)[0];

		var { width, height } = chartConfig;
		var canvasOriginX = 0.5 + chartConfig.origin[0] + this.context.margin.left;
		var canvasOriginY = 0.5 + chartConfig.origin[1] + this.context.margin.top;

		return { chartId, chartConfig, canvasOriginX, canvasOriginY, width, height };
	}
	render() {
		var origin = getChartOrigin(this.props.origin, this.context.width, this.context.height);
		var children = React.Children.map(this.props.children, (child) => {
			if (child === undefined || child === null) return child;
			var newChild = isReactVersion13()
			? React.withContext(this.getChildContext(), () => {
				return React.createElement(child.type, objectAssign( { key: child.key, ref: child.ref}, child.props ));
			})
			:child;
		return newChild;
		});

		var x = origin[0]; // + 0.5; // refer to http://www.rgraph.net/docs/howto-get-crisp-lines-with-no-antialias.html - similar fix for svg here
		var y = origin[1];
		return <g transform={`translate(${ x }, ${ y })`}>{children}</g>;
	}
}

Chart.propTypes = {
	height: React.PropTypes.number,
	width: React.PropTypes.number,
	origin: React.PropTypes.oneOfType([
				React.PropTypes.array,
				React.PropTypes.func
		]).isRequired,
	id: React.PropTypes.number.isRequired,
	xScale: React.PropTypes.func,
	yScale: React.PropTypes.func,
	xDomainUpdate: React.PropTypes.bool,
	yDomainUpdate: React.PropTypes.bool,
	yMousePointerDisplayLocation: React.PropTypes.oneOf(["left", "right"]),
	yMousePointerDisplayFormat: React.PropTypes.func,
	padding: React.PropTypes.object.isRequired,
};

Chart.defaultProps = {
	id: 0,
	namespace: "ReStock.Chart",
	transformDataAs: "none",
	yDomainUpdate: true,
	origin: [0, 0],
	yScale: d3.scale.linear(),
	padding: { top: 0, right: 0, bottom: 0, left: 0 },
};

Chart.contextTypes = {
	width: PropTypes.number.isRequired,
	height: PropTypes.number.isRequired,
	chartConfig: PropTypes.array,
	margin: PropTypes.object.isRequired,
	interactiveState: PropTypes.array.isRequired,
	currentItem: PropTypes.object.isRequired,
	mouseXY: PropTypes.array,
	show: PropTypes.bool,
	// adding here even when this is not used by Chart, refer to https://github.com/facebook/react/issues/2517
};

Chart.childContextTypes = {
	height: PropTypes.number,
	width: PropTypes.number,
	chartConfig: PropTypes.object.isRequired,
	canvasOriginX: PropTypes.number,
	canvasOriginY: PropTypes.number,
	chartId: PropTypes.number.isRequired,
};

export default Chart;

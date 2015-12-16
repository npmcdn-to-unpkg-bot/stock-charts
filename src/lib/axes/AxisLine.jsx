'use strict';

import React from 'react';

class AxisLine extends React.Component {
	render() {
		var {} = this.props;
		var sign = orient === "top" || orient === "left" ? -1 : 1;
		return (
			<path
				className={className}
				shapeRendering={shapeRendering}
				d={d}
				fill={fill}
				opacity={opacity}
				stroke={stroke}
				strokeWidth={strokeWidth} >
			</path>
		);
	}
}

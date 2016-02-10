'use strict';

import React from 'react';

class AxisLine extends React.Component {
	render() {
		var { orient } = this.props;
		var sign = orient === "top" || orient === "left" ? -1 : 1;

		var range =
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


<XAxis axisAt="bottom" orient="bottom" ticks={6}/>

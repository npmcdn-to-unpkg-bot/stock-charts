import React from 'react';

class EdgeCoordinate extends React.Component {
	render() {
		return (
			<div></div>
		);
	}
}

EdgeCoordinate.helper = (props) => {
	var { coordinate: displayCoordinate, show, rectWidth, type, orient, edgeAt, hideLine } = props;
	var { fill, opacity, fontFamily, fontSize, textFill, lineStroke, lineOpacity } = props;
	var { x1, y1, x2, y2 } = props;

	if (!show) return null;
	rectWidth = rectWidth ? reactWidth : (type === "horizontal") ? 60 : 100;
	var rectHeight = 20;

	var edgeXRect, edgeYRect, edgeXText, edgeYText;

	if (type === "horizontal") {}
};

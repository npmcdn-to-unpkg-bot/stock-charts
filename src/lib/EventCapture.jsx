"use strict";

import React, { PropTypes, Component } from "react";
import d3 from "d3";
import { mousePosition } from "./utils";

var mousemove = "mousemove.pan", mouseup = "mouseup.pan";

function d3Window(node) {
	var d3win = node && (node.ownerDocument && node.ownerDocument.defaultView || node.document && node || node.defaultView);
	return d3win;
}

class EventCapture extends Component {
	constructor(props) {
		super(props);
		this.handleEnter = this.handleEnter.bind(this);
		this.handleLeave = this.handleLeave.bind(this);
		this.handleMouseMove = this.handleMouseMove.bind(this);
		this.handleMouseDown = this.handleMouseDown.bind(this);
		this.handleWheel = this.handleWheel.bind(this);
		this.handlePanEnd = this.handlePanEnd.bind(this);
		this.handlePan = this.handlePan.bind(this);

		this.mouseInteraction = true;
	}

	componentWillMount() {
		if (this.context.onFocus) this.context.onFocus(this.props.defaultFocus);
	}

	handleMouseDown(e) {
		var mouseEvent = e || d3.event;
		var { pan } = this.props;
		var { onPanStart, focus, onFocus, xScale } = this.context;
		if (this.mouseInteraction && pan && onPanStart) {
			var mouseXY = mousePosition(mouseEvent);

			var dx = mouseEvent.pageX - mouseXY[0],
				dy = mouseEvent.pageY - mouseXY[1];

			var captureDOM = this.refs.capture;

			var win = d3Window(captureDOM);

			d3.select(win)
				.on(mousemove, this.handlePan)
				.on(mouseup, this.handlePanEnd);

			onPanStart(xScale.domain(), mouseXY, [dx, dy]);
		} else {
			if (!focus && onFocus) onFocus(true);
		}
		mouseEvent.preventDefault();
	}

	handleMouseMove(e) {
		if (this.mouseInteraction && this.context.onMouseMove && this.props.mouseMove) {
			if (!this.context.panInProgress) {
				var newPos = mousePosition(e);
				this.context.onMouseMove(newPos, "mouse", e);
			}
		}
	}

	handleLeave() {
		if (this.context.onMouseLeave) {
			this.context.onMouseLeave();
		}
	}

	handleEnter() {
		if (this.context.onMouseEnter) {
			this.context.onMouseEnter();
		}
	}

	handleWheel(e) {
		if (this.props.zoom
				&& this.context.onZoom
				&& this.context.focus) {
			e.stopPropagation();
			e.preventDefault();
			var zoomDir = e.deltaY > 0 ? this.props.zoomMultiplier : -this.props.zoomMultiplier;
			var newPos = mousePosition(e);
			this.context.onZoom(zoomDir, newPos);
			if (this.props.onZoom) {
				this.props.onZoom(e);
			}
		}
	}

	handlePan() {
		var { pan: panEnabled, onPan: panListener } = this.props;
		var { deltaXY: dxdy, xScale, onPan } = this.context;

		var e = d3.event;
		var newPos = [e.pageX - dxdy[0], e.pageY - dxdy[1]];

		if (this.mouseInteraction && panEnabled && onPan) {
			onPan(newPos, xScale.domain());
			if (panListener) {
				panListener(e);
			}
		}
	}

	handlePanEnd() {
		var e = d3.event;

		var { pan: panEnabled } = this.props;
		var { deltaXY: dxdy, onPanEnd } = this.context;

		var newPos = [e.pageX - dxdy[0], e.pageY - dxdy[1]];

		var captureDOM = this.refs.capture;

		var win = d3Window(captureDOM);

		if (this.mouseInteraction && panEnabled && onPanEnd) {
			d3.select(win)
				.on(mousemove, null)
				.on(mouseup, null);
			onPanEnd(newPos, e);
		}
	}

	render() {
		var className = this.context.panInProgress ? "react-stockcharts-grabbing-cursor" : "react-stockcharts-crosshair-cursor";
		return (
		  <rect ref="capture"
				className={className}
				width={this.context.width} height={this.context.height} style={{ opacity: 0 }}
				onMouseEnter={this.handleEnter}
				onMouseLeave={this.handleLeave}
				onMouseMove={this.handleMouseMove}
				onMouseDown={this.handleMouseDown}
				onWheel={this.handleWheel}
		  />
		);
	  }
	}

EventCapture.propTypes = {
	mouseMove: PropTypes.bool.isRequired,
	zoom: PropTypes.bool.isRequired,
	zoomMultiplier: PropTypes.number.isRequired,
	pan: PropTypes.bool.isRequired,
	panSpeedMultiplier: PropTypes.number.isRequired,
	defaultFocus: PropTypes.bool.isRequired,
	useCrossHairStyle: PropTypes.bool.isRequired,
	onZoom: PropTypes.func,
	onPan: PropTypes.func,
};

EventCapture.defaultProps = {
	mouseMove: false,
	zoom: false,
	zoomMultiplier: 1,
	pan: false,
	panSpeedMultiplier: 1,
	defaultFocus: false,
	useCrossHairStyle: true,

};

EventCapture.contextTypes = {
	width: PropTypes.number.isRequired,
	height: PropTypes.number.isRequired,
	panInProgress: PropTypes.bool,
	focus: PropTypes.bool.isRequired,
	chartConfig: PropTypes.array,
	xScale: PropTypes.func.isRequired,
	xAccessor: PropTypes.func.isRequired,
	deltaXY: PropTypes.arrayOf(Number),

	onMouseMove: PropTypes.func,
	onMouseEnter: PropTypes.func,
	onMouseLeave: PropTypes.func,
	onZoom: PropTypes.func,
	onPinchZoom: PropTypes.func,
	onPanStart: PropTypes.func,
	onPan: PropTypes.func,
	onPanEnd: PropTypes.func,
	onFocus: PropTypes.func,
};

export default EventCapture;

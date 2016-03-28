import React from 'react';

import { mousePosition } from "./utils/utils";

class EventCapture extends React.Component {
  constructor(props) {
    super(props);
    this.handleEnter = this.handleEnter.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleLeave = this.handleLeave.bind(this);
  }

  componentWillMount() {

  }

  handleMouseMove(e) {
  	if (this.context.onMouseMove && this.props.mouseMove) {
  		if (!this.context.panInProgress) {
  			var newPos = mousePosition(e);
  			this.context.onMouseMove(newPos, e);
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

  render() {
  	var className = this.context.panInProgress ? "react-stockcharts-grabbing-cursor" : "react-stockcharts-crosshair-cursor";
    return (
      <rect
      		className={className}
      		width={this.context.width} height={this.context.height} style={{ opacity : 0 }}
      		onMouseEnter={this.handleEnter}
            onMouseLeave={this.handleLeave}
      		onMouseMove={this.handleMouseMove}
      />
    );
  }
}

EventCapture.propTypes = {
	mainChart: React.PropTypes.number.isRequired,
	mouseMove: React.PropTypes.bool.isRequired,
	zoom: React.PropTypes.bool.isRequired,
	zoomMultiplier: React.PropTypes.number.isRequired,
	pan: React.PropTypes.bool.isRequired,
	panSpeedMultiplier: React.PropTypes.number.isRequired,
	defaultFocus: React.PropTypes.bool.isRequired,

	onZoom: React.PropTypes.func,
	onPan: React.PropTypes.func,
};

EventCapture.defaultProps = {
	namespace: "ReStock.EventCapture",
	mouseMove: false,
	zoom: false,
	zoomMultiplier: 1,
	pan: false,
	panSpeedMultiplier: 1,
	defaultFocus: false
};

EventCapture.contextTypes = {
	width: React.PropTypes.number.isRequired,
	height: React.PropTypes.number.isRequired,
	chartData: React.PropTypes.array,
	onMouseMove: React.PropTypes.func,
	onMouseEnter: React.PropTypes.func,
	onMouseLeave: React.PropTypes.func,
	onZoom: React.PropTypes.func,
	onPanStart: React.PropTypes.func,
	onPan: React.PropTypes.func,
	onPanEnd: React.PropTypes.func,
	panInProgress: React.PropTypes.bool,
	focus: React.PropTypes.bool.isRequired,
	onFocus: React.PropTypes.func,
	deltaXY: React.PropTypes.func,
};


export default EventCapture;

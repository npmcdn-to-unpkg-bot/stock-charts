"use strict";

var React = require("react");
// var ReactDOM = require("react-dom");
var d3 = require("d3");
var parseDate = d3.time.format("%Y-%m-%d").parse

require("stylesheets/stock-charts");

var Nav = require("lib/navbar");

class ExamplesPage extends React.Component {
	render() {

			return (
				<div>
					<Nav />

				</div>
			);
		}
};

React.render(<ExamplesPage />, document.getElementById("chart-goes-here"));

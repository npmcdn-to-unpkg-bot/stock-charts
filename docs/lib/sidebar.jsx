'use strict';

var React = require('react');

var Sidebar = React.createClass({
	render() {
		return (
			<div className="col-sm-3 col-md-2 sidebar">{this.props.children}</div>
		);
	}
});

module.exports = Sidebar;

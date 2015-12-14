require('../../dom-mock')('<html><body></body></html>');

var jsdom = require('mocha-jsdom');
var assert = require('chai').assert;
var React = require('react');
var TestUtils = require('react-addons-test-utils');
var ChartCanvas = require('../../../src/lib/ChartCanvas');
var ChartDataUtils = require('../../../src/lib/utils/ChartDataUtil');
var data = [1,2,3,4,5];

describe('ChartDataUtil', function () {

	jsdom({ skipWindowCheck: true });

	before('render and locate element', function () {
		this.renderedComponent = TestUtils.renderIntoDocument(
			<ChartCanvas width={400} height={400}
				margin={{left: 50, right: 50, top:10, bottom: 30}}
				data={data.slice(0, 150)} type="hybrid">
			</ChartCanvas>
		);
	});
	it('Is height 400', function () {
		assert.equal(this.renderedComponent.props.height, 400, "[message]");
	});
});

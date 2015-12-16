/*require('../../dom-mock')('<html><body></body></html>');

var jsdom = require('mocha-jsdom');
var assert = require('chai').assert;
var expect = require('chai').expect;
var React = require('react');
var shallowEqual = require('../../../src/lib/utils/shallowEqual');
var TestUtils = require('react-addons-test-utils');
import ChartContainer from '../../../src/lib/CanvasContainer';

var data = [1,2,3,4,5];

describe('ChartCanvas', function () {

	jsdom({ skipWindowCheck: true });

	before('render and locate element', function () {
		this.renderedComponent = TestUtils.renderIntoDocument(
			<ChartCanvas width={400} height={400}
				margin={{left: 50, right: 50, top:10, bottom: 30}}
				data={data.slice(0, 150)} type="hybrid">
			</ChartCanvas>
		);
	});
	it('Props Rendered Properly', function () {
		var margin = {left: 50, right: 50, top:10, bottom: 30};
		assert.equal(this.renderedComponent.props.height, 400);
		assert.equal(this.renderedComponent.props.width, 400);
		expect(shallowEqual(this.renderedComponent.props.margin, margin)).be.true;
		expect(this.renderedComponent.props.data).to.eql(data);
		assert.equal(this.renderedComponent.props.type, "hybrid");
	});
});
*/

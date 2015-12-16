/*require('../dom-mock')('<html><body></body></html>');

var jsdom = require('mocha-jsdom');
var assert = require('chai').assert;
var expect = require('chai').expect;
var React = require('react');
var shallowEqual = require('../../src/lib/utils/shallowEqual');
var TestUtils = require('react-addons-test-utils');
import EventHandler from '../../src/lib/EventHandler';
import DummyTransformer from '../../src/lib/transforms';

describe('EventHandler', function () {

	jsdom({ skipWindowCheck: true });

	before('render and locate element', function () {
		this.renderedComponent = TestUtils.renderIntoDocument(
			<ChartCanvas width={400} height={400}
				margin={{left: 50, right: 50, top:10, bottom: 30}}
				data={data.slice(0, 150)} type="hybrid">
			</ChartCanvas>
		);
	});

	it('getTransformedData()',  () => {
		var eventHandler = new EventHandler();
		var defaultDataTransform = [ { transform: DummyTransformer } ];
		var rawData = [1,2,3,4,5,6,7,8,9];
		var dataTransforms = [ ];
		var interval = "D";
		console.log(eventHandler.getTransformedData(rawData, defaultDataTransform, dataTransforms, interval));
	});
});
*/

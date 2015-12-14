var expect = require('chai').expect;

var shallowEqual = require("../../../src/lib/utils/shallowEqual");

describe("shallowEqual", function() {
	it('should return true when keys and value are same', function () {
		expect(shallowEqual({a: true, b: true}, {a: true, b: true})).be.true;
	});

	it('should return false when keys are different:', function () {
		 expect(shallowEqual({a: true, b: false}, {c: false, b: false})).be.false;
	});

	it('should return false when values are different:', function () {
	    expect(shallowEqual({a: true, b: false}, {a: false, b: false})).be.false;
	    expect(shallowEqual({a: true, b: true}, {a: true, b: 'true'})).be.false;
	});

	it('should return false when a value is not a primitive:', function () {
	    expect(shallowEqual({ b: {}}, { b: {}})).be.false;
	    expect(shallowEqual({ b: [1,2]}, { b: [1,2]})).be.false;
	});

	it('should return false when a value is present in one object but not the other', function () {
	    expect(shallowEqual({a: true, b: true, c: true}, {a: true, b: true})).be.false;
	    expect(shallowEqual({a: true, b: true}, {a: true, b: true, c: true})).be.false;
	});
});

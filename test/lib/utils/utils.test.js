var expect = require("chai").expect;

import Utils from "../../../src/lib/utils/utils";

describe("Utils", function() {
	it("Check React Version 13", function() {
		expect(Utils.isReactVersion13()).be.false;
	});
	it("Check React Version 14", function() {
		expect(Utils.isReactVersion14()).be.true;
	});
});

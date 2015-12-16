var expect = require("chai").expect;

import Utils from "../../../src/lib/utils/utils";

describe("Utils", function() {
	it("Check React Version 13", function() {
		expect(Utils.isReactVersion13()).be.false;
	});
	it("Check React Version 14", function() {
		expect(Utils.isReactVersion14()).be.true;
	});
	describe('getter()', function () {
		it('Simple Object with primitive key/value pairs', function () {
			var obj = {
						a: 1,
						b: 2,
						c: 'd'
					  };
			expect(Utils.getter(obj, 'a')).to.equal(1);
			expect(Utils.getter(obj, 'b')).to.equal(2);
			expect(Utils.getter(obj, 'c')).to.equal('d');
		});
		it('Object with key/values as string/Obj', function (done) {
			var obj = {
				a: 1,
				b: {
					c: 2,
					d: 'a',
					e: {
						aa: 11,
						bb: 'aa',
						cc: {
							aaa: 111
						}
					}
				}
			};
			expect(Utils.getter(obj, 'a')).to.equal(1);
			expect(Utils.getter(obj, 'c')).to.be.undefined;
			expect(Utils.getter(obj, 'b.c')).to.equal(2);
			expect(Utils.getter(obj, 'b.e')).to.deep.equal({aa:11, bb: 'aa', cc: { aaa: 111 }});
			expect(Utils.getter(obj, 'b.e.cc.aaa')).to.equal(111);
			done();
		});
	});
});

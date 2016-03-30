"use strict";

import d3 from "d3";
import noop from "./noop";
import identity from "./identity";

export default function() {

	var accumulateTill = d3.functor(false),
		accumulator = noop,
		value = identity;

	var accumulatingWindow = function(data) {
		var accumulatedWindow = [];
		var response = [];
		var accumulatorIdx = 0;
		for (var i = 0; i < data.length; i++) {
			var d = data[i];
			if (accumulateTill(d)) {
				if (accumulatedWindow.length > 0) response.push(accumulator(accumulatedWindow, i, accumulatorIdx++));
				accumulatedWindow = [value(d)];
			} else {
				accumulatedWindow.push(value(d));
			}
		}
	}

	accumulatingWindow.accumulateTill = function(x) {
		if (!arguments.length) {
			return accumulateTill;
		}
		accumulateTill = d3.functor(x);
		return accumulatingWindow;
	};
	accumulatingWindow.accumulator = function(x) {
		if (!arguments.length) {
			return accumulator;
		}
		accumulator = x;
		return accumulatingWindow;
	};
	accumulatingWindow.value = function(x) {
		if (!arguments.length) {
			return value;
		}
		value = x;
		return accumulatingWindow;
	};

	return accumulatingWindow;
}

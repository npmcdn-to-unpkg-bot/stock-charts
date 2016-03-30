"use strict";

import d3 from "d3";
import noop from "./noop";
import identity from "./identity";

export default function() {

	var undefinedValue = undefined,
		windowSize = 10,
		accumulator = noop,
		source = identity,
		skipInitial = 0;

	var slidingWindow = function(data) {
		var size = d3.functor(windowSize).apply(this, arguments);
		var windowData = data.slice(skipInitial, size + skipInitial).map(source);
		var accumulatorIdx = 0;
		var undef = d3.functor(undefinedValue);
		// console.log(skipInitial, size, data.length, windowData.length);
		return data.map(function(d, i) {
			// console.log(d, i);
			if (i < (skipInitial + size - 1)) {
				return undef(d, i);
			}
			if (i >= (skipInitial + size)) {
				// Treat windowData as FIFO rolling buffer
				windowData.shift();
				windowData.push(source(d, i));
			}
			return accumulator(windowData, i, accumulatorIdx++);
		});
	};

	slidingWindow.undefinedValue = function(x) {
		if (!arguments.length) {
			return undefinedValue;
		}
		undefinedValue = x;
		return slidingWindow;
	};
	slidingWindow.windowSize = function(x) {
		if (!arguments.length) {
			return windowSize;
		}
		windowSize = x;
		return slidingWindow;
	};
	slidingWindow.accumulator = function(x) {
		if (!arguments.length) {
			return accumulator;
		}
		accumulator = x;
		return slidingWindow;
	};
	slidingWindow.skipInitial = function(x) {
		if (!arguments.length) {
			return skipInitial;
		}
		skipInitial = x;
		return slidingWindow;
	};
	slidingWindow.source = function(x) {
		if (!arguments.length) {
			return source;
		}
		source = x;
		return slidingWindow;
	};

	return slidingWindow;
}

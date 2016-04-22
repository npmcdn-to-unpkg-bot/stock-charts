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

	var mappedSlidingWindow = function(data) {
		var size = d3.functor(windowSize).apply(this, arguments);
		var undef = d3.functor(undefinedValue);
		var accumulatorIdx = 0;
		var windowData = [];
		var result = [];

		data.forEach(function(d, i) {
			var mapped;
			if (i < (skipInitial + size - 1)) {
				mapped = undef(d, i);
				result.push(mapped);
				windowData.push(mapped);
				return;
			}
			if (i >= (skipInitial + size)) {
				windowData.shift();
			}
			windowData.push(source(d, i));
			mapped = accumulator(windowData, i, accumulatorIdx++);
			result.push(mapped);
			windowData.pop();
			windowData.push(mapped);
			return;
		});
		return result;
	}

	mappedSlidingWindow.undefinedValue = function(x) {
		if (!arguments.length) {
			return undefinedValue;
		}
		undefinedValue = x;
		return mappedSlidingWindow;
	};

	mappedSlidingWindow.windowSize = function(x) {
		if (!arguments.length) {
			return windowSize;
		}
		windowSize = x;
		return mappedSlidingWindow;
	};

	mappedSlidingWindow.accumulator = function(x) {
		if (!arguments.length) {
			return accumulator;
		}
		accumulator = x;
		return mappedSlidingWindow;
	};

	mappedSlidingWindow.source = function(x) {
		if (!arguments.length) {
			return source;
		}
		source = x;
		return mappedSlidingWindow;
	};

	mappedSlidingWindow.skipInitial = function(x) {
		if (!arguments.length) {
			return skipInitial;
		}
		skipInitial = x;
		return mappedSlidingWindow;
	};

	return mappedSlidingWindow;
}

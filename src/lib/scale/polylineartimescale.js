//Creating a custom scale extending d3 linear scale.

import d3 from "d3";

function financeTimeScale(drawableData, indexAccessor, backingLinearScale, dateAccessor = d => d.date) {

	function scale(x) {
		return backingLinearScale(x);
	}

	scale.isPolyLinear = function() {
		return true;
	};

	scale.invert = function(x) {
		return backingLinearScale.invert(x);
	};

	scale.data = function() {
		if (!arguments.length) {
			return drawableData;
		} else {
			drawableData = x;
		}
	};

	// Why taking just the 0 and 1 element.
	scale.domain = function(x) {
		if (!arguments.length) return backingLinearScale.domain();

		var d = [x[0], x[1]];
		backingLinearScale.domain(d);
		return scale;
	};

	scale.range = function(x) {
		if (!arguments.length) return backingLinearScale.range();
		backingLinearScale.range(x);
		return scale;
	};

	// Why arent we rounding by calling the rangeround on the linear scale
	scale.rangeRound = function(x) {
		return backingLinearScale.range(x);
	};

	scale.clamp = function(x) {
		if (!arguments.length) return backingLinearScale.clamp();
		backingLinearScale.clamp(x);
		return scale;
	};

	scale.interpolate = function(x) {
		if (!arguments.length) return backingLinearScale.interpolate();
		backingLinearScale.interpolate(x);
		return scale;
	};

	scale.ticks = function(m) {
		var start, end, count = 0;
		drawableData.forEach(function(d) {
			if (dateAccessor(d) !== undefined) {
				if (start === undefined) start = d;
				end = d;
				count++;
			}
		});
		m = (count / drawableData.length) * m;
		var span = (dateAccessor(end).getTime() - dateAccessor(start).getTime());
		var target = span / m;

		var ticks = drawableData
						.filter(timeScaleSteps[timeScaleStepsBisector(timeScaleSteps, target)].f)
						.map(function(d) { return indexAccessor(d); })
						;
		// return the index of all the ticks to be displayed,
		// console.log(target, span, m, ticks);
		return ticks;
	};

	return scale;
}

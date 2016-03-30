"use strict";

import {
	isDefined,
	isNotDefined,
	isArray,
} from "../utils";

import eodIntervalCalculator from "./eodIntervalCalculator";

function extentsWrapper(inputXAccessor, realXAccessor, allowedIntervals, canShowTheseMany, useWholeData = false) {
	var data, inputXAccessor, interval, width, currentInterval, currentDomain, currentPlotData, scale;
	function domain(inputDomain, xAccessor) {
		var left = first(inputDomain);
		var right = last(inputDomain);
		var plotData = currentPlotData, intervalToShow = currentInterval, domain;

		if (useWholeData) {
			return { plotData: data, scale: scale.copy().domain(inputDomain) };
		}

		if (isNotDefined(interval) && isArray(allowedIntervals)) {
			let dataForCurrentInterval = data[currentInterval || allowedIntervals[0]];

			/*var leftIndex = getClosestItemIndexe*/
		}
	}
	return domain;
}

function canShowTheseManyPeriods() {

}

export default function() {
	var allowedIntervals, xAccessor, discontinous = false, useWholeData,
		indexAccessor, indexMutator, map, scale, calculator = [], intervalCalculator = eodIntervalCalculator,
		canShowTheseMany = canShowTheseManyPeriods;

	function evaluate (data) {
		if (discontinous
				&& (isNotDefined(scale.isPolyLinear)
						|| (isDefined(scale.isPolyLinear) && !scale.isPolyLinear()))) {
			throw new Error("you need a scale that is capable of handling discontinous data. change the scale prop or set discontinous to false");
		}
		var realXAccessor = discontinous ? indexAccessor : xAccessor;

		var xScale = (discontinous && isDefined(scale.isPolyLinear) && scale.isPolyLinear())
			? scale.copy().indexAccessor(realXAccessor).dateAccessor(xAccessor)
			: scale;

		var calculate = intervalCalculator()
			.doIt(isDefined(xScale.isPolyLinear))
			.allowedIntervals(allowedIntervals);

		var mappedData = calculate(data.map(map));

		if (discontinous) {
			calculator.unshift(values => values.map((d, i) => {
				indexMutator(d, i);
				return d;
			}));
		}
		// console.log(mappedData);

		calculator.forEach(each => {
			var newData;
			if (isArray(mappedData)) {
				newData = each(mappedData);
			} else {
				newData = {};
				Object.keys(mappedData)
					.forEach(key => {
						newData[key] = each(mappedData[key]);
					});
			}
			mappedData = newData;
		});


		return {
			fullData: mappedData,
			xAccessor: realXAccessor,
			// inputXAccesor: xAccessor,
			domainCalculator: extentsWrapper(xAccessor, realXAccessor, allowedIntervals, canShowTheseMany, useWholeData),
		};
	}
	evaluate.allowedIntervals = function(x) {
		if (!arguments.length) return allowedIntervals;
		allowedIntervals = x;
		return evaluate;
	};
	evaluate.intervalCalculator = function(x) {
		if (!arguments.length) return intervalCalculator;
		intervalCalculator = x;
		return evaluate;
	};
	evaluate.xAccessor = function(x) {
		if (!arguments.length) return xAccessor;
		xAccessor = x;
		return evaluate;
	};
	evaluate.discontinous = function(x) {
		if (!arguments.length) return discontinous;
		discontinous = x;
		return evaluate;
	};
	evaluate.indexAccessor = function(x) {
		if (!arguments.length) return indexAccessor;
		indexAccessor = x;
		return evaluate;
	};
	evaluate.indexMutator = function(x) {
		if (!arguments.length) return indexMutator;
		indexMutator = x;
		return evaluate;
	};
	evaluate.map = function(x) {
		if (!arguments.length) return map;
		map = x;
		return evaluate;
	};
	evaluate.scale = function(x) {
		if (!arguments.length) return scale;
		scale = x;
		return evaluate;
	};
	evaluate.useWholeData = function(x) {
		if (!arguments.length) return useWholeData;
		useWholeData = x;
		return evaluate;
	};
	evaluate.calculator = function(x) {
		if (!arguments.length) return calculator;
		calculator = x;
		return evaluate;
	};

	return evaluate;
}

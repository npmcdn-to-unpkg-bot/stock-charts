"use strict";
import d3 from "d3";

import identity from "./identity";
import slidingWindow from "./slidingWindow";
import accumulatingWindow from "./accumulatingWindow";
import mappedSlidingWindow from "./mappedSlidingWindow";
import shallowEqual from "./shallowEqual";
import zipper from "./zipper";
import merge from "./merge";

export {
	mappedSlidingWindow,
	identity,
	slidingWindow,
	accumulatingWindow,
	shallowEqual,
	zipper,
	merge,
};

export const overlayColors = d3.scale.category10();

export function head(array, accessor) {
	if (accessor && array) {
		var value;
		for (var i = 0; i < array.length; i++) {
			value = array[i];
			if (isDefined(accessor(value))) break;
		};
		return value;
	}
	return array ? array[0] : undefined;
}

export const first = head;

export function last(array, accessor) {
	if (accessor && array) {
		var value;
		for (var i = array.length - 1; i >= 0; i--) {
			value = array[i];
			if (isDefined(accessor(value))) break;
		};
		return value;
	}
	var length = array ? array.length : 0;
	return length ? array[length - 1] : undefined;
}

export function isDefined(d) {
	return d !== null && typeof d !== "undefined";
}

export function isNotDefined(d) {
	return !isDefined(d);
}

export function isObject(d) {
	return isDefined(d) && typeof d === "object" && !Array.isArray(d);
}

export const isArray = Array.isArray;

export function mousePosition(e) {
	var container = e.currentTarget,
		rect = container.getBoundingClientRect(),
		x = e.clientX - rect.left - container.clientLeft,
		y = e.clientY - rect.top - container.clientTop,
		xy = [Math.round(x), Math.round(y)];
	return xy;
};

export function getClosestItemIndexes(array, value, accessor, log) {
	var lo = 0,
		hi = array.length - 1;
	while (hi - lo > 1) {
		var mid = Math.round((lo + hi) / 2);
		if (accessor(array[mid]) <= value) {
			lo = mid;
		} else {
			hi = mid;
		}
	}
	// for Date object === does not work, so using the <= in combination with >=
	// the same code works for both dates and numbers
	if (accessor(array[lo]) >= value && accessor(array[lo]) <= value) hi = lo;
	if (accessor(array[hi]) >= value && accessor(array[hi]) <= value) lo = hi;

	if (accessor(array[lo]) < value && accessor(array[hi]) < value) lo = hi;
	if (accessor(array[lo]) > value && accessor(array[hi]) > value) hi = lo;

	return {
		left: lo,
		right: hi
	};
};

export function hexToRGBA(inputHex, opacity) {
	var hex = inputHex.replace("#", "");
	if (inputHex.indexOf("#") > -1 && (hex.length === 3 || hex.length === 6)) {

		var multiplier = (hex.length === 3) ? 1 : 2;

		var r = parseInt(hex.substring(0, 1 * multiplier), 16);
		var g = parseInt(hex.substring(1 * multiplier, 2 * multiplier), 16);
		var b = parseInt(hex.substring(2 * multiplier, 3 * multiplier), 16);

		var result = `rgba(${ r }, ${ g }, ${ b }, ${ opacity })`;

		return result;
	}
	return inputHex;
};

export function getClosestItem(array, value, accessor, log) {
	var {
		left, right
	} = getClosestItemIndexes(array, value, accessor, log);

	if (left === right) {
		return array[left];
	}

	var closest = (Math.abs(accessor(array[left]) - value) < Math.abs(accessor(array[right]) - value)) ? array[left] : array[right];
	if (log) {
		console.log(array[left], array[right], closest, left, right);
	}
	return closest;
};

export function clearCanvas(canvasList) {
	canvasList.forEach(each => {
		each.setTransform(1, 0, 0, 1, 0, 0);
		each.clearRect(-1, -1, each.canvas.width + 2, each.canvas.height + 2);
	});
};

"use strict";

import React from "react";
import d3 from "d3";

var overlayColors = d3.scale.category10();

var Utils = {
	overlayColors: overlayColors,
	isReactVersion13() {
		var version = React.version.split(".")[1];
		return version === "13";
	},
	isReactVersion14() {
		return React.version.split(".")[1] === "14";
	},
	keysAsArray(obj) {
		return Object.keys(obj)
			.filter( (key) => obj[key] !== null )
			.map( (key) => obj[key] );
	},
	pluck(array, key) {
		return array.map( (each) => Utils.getter(each, key) );
	},
	keysAsArray(obj) {
		return Object.keys(obj)
			.filter((key) => obj[key] !== null)
			.map((key) => obj[key]);
	},
	getter(obj, pluckKey) {
		var keys = pluckKey.split(".");
		var value;
		keys.forEach(key => {
			if (!value) value = obj[key];
			else value = value[key];
		});
		return value;
	},
	getClosestItemIndexes(array, value, accessor) {
		var lo = 0, hi = array.length - 1;
		while (hi - lo > 1) {
			var mid = Math.round((lo + hi) / 2);
			if (accessor(array[mid]) <= value) {
				lo = mid;
			} else {
				hi = mid;
			}
		}
		if (accessor(array[lo]) === value) hi = lo;
		// console.log(array[lo], array[hi], closestIndex, lo, hi);
		return {
			left: value > accessor(array[lo]) ? hi : lo,
			right: value >= accessor(array[hi]) ? hi + 1 : hi
		};
	},
};

export default Utils;

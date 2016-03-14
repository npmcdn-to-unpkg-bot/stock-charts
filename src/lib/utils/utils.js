"use strict";

import React from "react";
import d3 from "d3";

export const overlayColors = d3.scale.category10();

export function isReactVersion13() {
    var version = React.version.split(".")[1];
    return version === "13";
};

export function isReactVersion14() {
    return React.version.split(".")[1] === "14";
};

export function mousePosition(e) {
    var container = e.currentTarget,
        rect = container.getBoundingClientRect(),
        x = e.clientX - rect.left - container.clientLeft,
        y = e.clientY - rect.top - container.clientTop,
        xy = [Math.round(x), Math.round(y)];
    return xy;
};

export function cloneMe(obj) {
    if (obj == null || typeof (obj) !== "object") {
        return obj;
    }
    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }
    var temp = {}; // obj.constructor(); // changed

    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            temp[key] = cloneMe(obj[key]);
        }
    }
    return temp;
};

export function keysAsArray(obj) {
    return Object.keys(obj)
        .filter((key) => obj[key] !== null)
        .map((key) => obj[key]);
};
export function pluck(array, key) {
    return array.map((each) => getter(each, key));
};
export function keysAsArray(obj) {
    return Object.keys(obj)
        .filter((key) => obj[key] !== null)
        .map((key) => obj[key]);
};
export function getter(obj, pluckKey) {
    var keys = pluckKey.split(".");
    var value;
    keys.forEach(key => {
        if (!value) value = obj[key];
        else value = value[key];
    });
    return value;
};
export function getClosestItemIndexes(array, value, accessor) {
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
    if (accessor(array[lo]) === value) hi = lo;
    // console.log(array[lo], array[hi], closestIndex, lo, hi);
    return {
        left: value > accessor(array[lo]) ? hi : lo,
        right: value >= accessor(array[hi]) ? hi + 1 : hi
    };
};

export function getClosestItem(array, value, accessor) {
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
	var closest = (Math.abs(accessor(array[lo]) - value) < Math.abs(accessor(array[hi]) - value))
						? array[lo]
						: array[hi];
	// console.log(array[lo], array[hi], closest, lo, hi);
	return cloneMe(closest);
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

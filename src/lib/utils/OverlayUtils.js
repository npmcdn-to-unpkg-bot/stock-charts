"use strict";

import { cloneMe } from "./utils";

export function firstDefined(data, accessor) {
	var each;
	for (var i = 0; i < data.length; i++) {
		if (accessor(data[i]) === undefined) continue;
		each = data[i];
		console.log(i, each, accessor(each));
		break;
	}
	return cloneMe(each);
};

export function lastDefined(data, accessor) {
	var each;
	for (var i = data.length - 1; i >= 0; i--) {
		if (accessor(data[i]) === undefined) continue;
		each = data[i];

		break;
	}
	return cloneMe(each);
};

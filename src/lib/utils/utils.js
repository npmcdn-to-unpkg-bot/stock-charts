"use strict";

import React from "react";

var Utils = {
	isReactVersion13() {
		var version = React.version.split(".")[1];
		return version === "13";
	},
	isReactVersion14() {
		return React.version.split(".")[1] === "14";
	},
	pluck(array, key) {
		return array.map( (each) => Utils.getter(each, key) );
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
};

export default Utils;

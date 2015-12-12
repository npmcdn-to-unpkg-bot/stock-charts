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
};

export default Utils;

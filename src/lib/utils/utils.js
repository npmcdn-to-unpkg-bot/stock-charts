"use strict";

import React from "react";

var Utils = {
	isReactVersion14() {
		return React.version.split(".")[1] === "14";
	},
};

export default Utils;

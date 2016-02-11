"use strict";

import Utils from "./utils";

var OverlayUtils = {
	getToolTipLabel(props) {
		if (props.type === "sma" || props.type === "ema") {
			var tooltip = props.type.toUpperCase() + "(" + props.options.period + ")";
			return tooltip;
		}
		return "N/A";
	},
	firstDefined(data, accessor) {
		var each;
		for (var i = 0; i < data.length; i++) {
			if (accessor(data[i]) === undefined) continue;
			each = data[i];
			break;
		}
		return Utils.cloneMe(each);
	},
	lastDefined(data, accessor) {
		var each;
		for (var i = data.length - 1; i >= 0; i--) {
			if (accessor(data[i]) === undefined) continue;
			each = data[i];
			break;
		}
		return Utils.cloneMe(each);
	}
};

export default OverlayUtils;

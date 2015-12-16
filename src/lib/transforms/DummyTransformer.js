"use strict";

export function DummyTransformer() {
	function transform(data, interval) {
		var responseData = {};
		responseData[interval] = data;

		return responseData;
	};

	transform.options = function(opt) {
		return opt;
	};
	return transform;
}



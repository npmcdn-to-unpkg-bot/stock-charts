"use strict";

import stockScale from "../scale/polylineartimescale";
import objectAssign from "object-assign";

var defaultOptions = {
    dateAccessor: (d) => d.date,
    dateMutator: (d, date) => { d.date = date; },
    indexAccessor: (d) => d.idx,
    indexMutator: (d, i) => { d.idx = i; }
};


/**
*	 When Calculating Weekly data from daily data
*	 weekly open is the open of the first day.
*	 weekly high is the highest of each daily high.
*	 weekly low is the lowest of each daily low.
*	 weekly close is the close of the last day.
*
*
*/
function buildWeeklyData(daily, indexMutator, dateAccessor, dateMutator) {

    var weekly = [], prevWeek, eachWeek = {};

    for (var i = 0; i < daily.length; i++) {

        var d = daily[i];

        if (dateAccessor(eachWeek)) indexMutator(eachWeek, i);

        dateMutator(eachWeek, dateAccessor(d));

        eachWeek.startOfWeek = eachWeek.startOfWeek || d.startOfWeek;
        eachWeek.startOfMonth = eachWeek.startOfMonth || d.startOfMonth;
        eachWeek.startOfQuarter = eachWeek.startOfQuarter || d.startOfQuarter;
        eachWeek.startOfYear = eachWeek.startOfYear || d.startOfYear;

        if (!eachWeek.open) eachWeek.open = d.open;
        if (!eachWeek.high) eachWeek.high = d.high;
        if (!eachWeek.low) eachWeek.low = d.low;

        eachWeek.close = d.close;

        eachWeek.high = Math.max(eachWeek.high, d.high);
        eachWeek.low = Math.min(eachWeek.low, d.low);

        if (!eachWeek.volume) eachWeek.volume = 0;
        eachWeek.volume += d.volume;

        eachWeek = objectAssign({}, d, eachWeek);

        if (d.startOfWeek) {
        	if (prevWeek) {
        		eachWeek.trueRange(
        			eachWeek.high - eachWeek.low
        			, eachWeek.high - prevWeek.close // TODO: Revist Should be absolute value of this.
        			, eachWeek.low - prevWeek.close
        		);
        	}
        prevWeek = eachWeek;
        weekly.push(eachWeek);
        eachWeek = {};
        }
    }
    return weekly;
}

function buildMonthlyData(daily, indexMutator, dateAccesor, dateMutator) {
	var monthly = [], prevMonth, eachMonth = {};
	for (var i = 0; i < daily.length; i++) {
		var d = daily[i];

		if (dateAccesor(eachMonth)) indexMutator(eachMonth, i);

		dateMutator(eachMonth, dateAccesor(d));

		eachMonth.startOfMonth = eachMonth.startOfMonth || d.startOfMonth;
		eachMonth.startOfQuarter = eachMonth.startOfQuarter || d.startOfQuarter;
		eachMonth.startOfYear = eachMonth.startOfYear || d.startOfYear;

		if (!eachMonth.open) eachMonth.open = d.open;
		if (!eachMonth.high) eachMonth.high = d.high;
		if (!eachMonth.low) eachMonth.low = d.low;

		eachMonth.close = d.close;

		eachMonth.high = Math.max(eachMonth.high, d.high);
		eachMonth.low = Math.min(eachMonth.low, d.low);

		if (!eachMonth.volume) eachMonth.volume = 0;
		eachMonth.volume += d.volume;

		eachMonth = objectAssign({}, d, eachMonth);

		if (d.startOfMonth) {
			eachMonth.startOfWeek = d.startOfWeek;
			if (prevMonth) {
				eachMonth.trueRange = Math.max(
					eachMonth.high - eachMonth.low
					, eachMonth.high - prevMonth.close
					, eachMonth.low - prevMonth.close
				);
			}
			prevMonth = eachMonth;
			monthly.push(eachMonth);
			eachMonth = {};
		}

	}
	return monthly;
}

function StockscaleTransformer() {
	var newOptions;
    function transform(data, interval) {
    	var { dateAccessor, dateMutator, indexMutator } = newOptions;
        var responseData = {};

        var prevDate;
        var dd = data[interval];
        responseData.D = dd
            .map((each, i) => {
                var row = {};
                Object.keys(each)
                    .forEach((key) => {
                        row[key] = each[key];
                    });

                indexMutator(d, i);

                row.startOfWeek = false;
                row.startOfMonth = false;
                row.startOfQuarter = false;
                row.startOfYear = false;

                var date = dateAccessor(row);

                if (prevDate !== undefined) {

                    row.startOfWeek = date.getDay() < prevDate.getDay();

                    row.startOfMonth = date.getMonth() !== prevDate.getMonth();

                    row.startOfQuarter = row.startOfMonth && date.getMonth() % 3 === 0;

                    row.startOfYear = date.getYear() !== prevDate.getYear();
                }

                prevDate = date;
                return row;
            });
        responseData.W = buildWeeklyData(responseData.D, indexMutator, dateAccessor, dateMutator);
		responseData.M = buildMonthlyData(responseData.D, indexMutator, dateAccessor, dateMutator);
		return responseData;

    }
    transform.options = function(opt) {
		newOptions = objectAssign({}, defaultOptions, opt);
		newOptions.xAccessor = newOptions.indexAccessor;
		newOptions.xScale = stockScale(newOptions.xAccessor);
		return newOptions;
	};
	return transform;
}

export default StockscaleTransformer;

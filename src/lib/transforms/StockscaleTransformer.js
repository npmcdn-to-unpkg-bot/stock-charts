function StockscaleTransformer() {

	var defaultOptions = {
		dateAccessor: (d) => d.date,
		dateMutator: (d, date) => { d.date = date; },
		indexAccessor: (d) => d.idx,
		indexMutator: (d, i) => { d.idx = i; }
	};

	function buildWeeklyData(daily, indexMutator, dateAccessor, dateMutator) {

		//When Calculating Weekly data from daily data
		// weekly open is the open of the first day.
		// weekly high is the highest of each daily high.
		//weekly low is the lowest of each daily low.
		// weekly close is the close of the last day.
		var eachWeek = {};

		for (var i = 0; i < daily.length; i++) {

			var d = daily[i];

			if (dateAccessor(eachWeek)) indexMutator(eachWeek, i);

			dateMutator(eachWeek, dateAccessor(d));

			eachWeek.startOfWeek = eachWeek.startOfWeek || d.startOfWeek;
			eachWeek.startOfMonth = eachWeek.startOfMonth || d.startOfMonth;
			eachWeek.startOfQuarter = eachWeek.startOfQuarter || d.startOfQuarter;
			eachWeek.startOfYear = eachWeek.startOfYear || d.startOfYear;


		}
	}

	function transform(data, interval) {
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

					row.startOfYear = date.getYear() !=== prevDate.getYear();
				}

				prevDate = date;
				return row;
			});
		responseData.W = buildWeeklyData(dd, );
		responseData.M = buildMonthlyData();

	}
	return transform;
}

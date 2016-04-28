"use strict";

var React = require("react");
var ReactDOM = require("react-dom");
var d3 = require("d3");
var parseDate = d3.time.format("%Y-%m-%d").parse

import "stylesheets/stock-charts";

import Nav from "lib/navbar";
import MainContainer from "lib/main-container";
import Sidebar from "lib/sidebar";
import MenuGroup from "lib/menu-group";
import MenuItem from "lib/MenuItem";

var DOCUMENTATION = {
	head: "Documentation",
	pages: [
		require("lib/page/GettingStartedPage"),
	]
};


var CHART_TYPES = {
	head: "Chart Types",
	pages: [
		require("lib/page/AreaChartPage"),
		require("lib/page/LineAndScatterChartPage").default,
		require("lib/page/BarChartPage").default,
		require("lib/page/CandleStickChartPage").default,
		require("lib/page/VolumeBarPage").default,
		require("lib/page/HeikinAshiPage").default,
	]
};

var ALL_PAGES = [
	DOCUMENTATION,
	CHART_TYPES,
];

var pages = d3.merge(ALL_PAGES.map(_ => _.pages));

function compressString(string) {
	string = string.replace(/\s+/g, "_");
	string = string.replace(/[-&]/g, "_");
	string = string.replace(/_+/g, "_");
	string = string.toLowerCase();
	// console.log(string);
	return string
}

function renderPage(data, dataFull, compareData, bubbleData, barData, groupedBarData, horizontalBarData, horizontalGroupedBarData){
	data.forEach((d, i) => {
		d.date = new Date(parseDate(d.date).getTime());
		d.open = +d.open;
		d.high = +d.high;
		d.low = +d.low;
		d.close = +d.close;
		d.volume = +d.volume;
		// console.log(d);
	});

	dataFull.forEach((d, i) => {
		d.date = new Date(parseDate(d.date).getTime());
		d.open = +d.open;
		d.high = +d.high;
		d.low = +d.low;
		d.close = +d.close;
		d.volume = +d.volume;
		// console.log(d);
	});
	compareData.forEach((d, i) => {
		d.date = new Date(parseDate(d.date).getTime());
		d.open = +d.open;
		d.high = +d.high;
		d.low = +d.low;
		d.close = +d.close;
		d.volume = +d.volume;
		d.SP500Close = +d.SP500Close;
		d.AAPLClose = +d.AAPLClose;
		d.GEClose = +d.GEClose;
		// console.log(d);
	});

	var selected = location.hash.replace("#/", "");
	var selectedPage = pages.filter((page) => (compressString(page.title) === compressString(selected)));

	var firstPage = (selectedPage.length === 0) ? pages[0] : selectedPage[0];

	class ExamplesPage extends React.Component {
		constructor(props) {
			super(props);
			this.handleRouteChange = this.handleRouteChange.bind(this);
			this.state = {
				selectedPage: firstPage
			}
		}
		handleRouteChange() {
			let selected = location.hash.replace("#/", "");
			let selectedPage = pages.filter((page) => (compressString(page.title) === compressString(selected)));
			if (selectedPage.length > 0) {
				this.setState({
					selectedPage: selectedPage[0]
				});
			}
		}
		componentDidMount() {
			window.addEventListener("hashchange", this.handleRouteChange, false);
		}
		render() {
				var Page = this.state.selectedPage;
				return (
					<div>
						<Nav />
						<MainContainer>
							<Sidebar>
							{ALL_PAGES.map((eachGroup, i) =>
								<div key={i}>
									<h4>{eachGroup.head}</h4>
									<MenuGroup>
										{eachGroup.pages.map((eachPage, idx) => <MenuItem key={idx} current={eachPage === this.state.selectedPage} title={eachPage.title} anchor={compressString(eachPage.title)} />)}
									</MenuGroup>
								</div>
							)}
							</Sidebar>
							<Page someData={data}
									lotsOfData={dataFull}
									compareData={compareData}
									barData={barData} />
						</MainContainer>
					</div>
				);
			}
	};

	ReactDOM.render(<ExamplesPage />, document.getElementById("chart-goes-here"));
}

d3.tsv("data/MSFT_full.tsv", (err2, MSFTFull) => {
	d3.tsv("data/MSFT.tsv", (err, MSFT) => {
		d3.tsv("data/comparison.tsv", (err3, compareData) => {
			d3.json("data/bubble.json", (err4, bubbleData) => {
				d3.json("data/barData.json", (err5, barData) => {
					d3.json("data/groupedBarData.json", (err6, groupedBarData) => {
						var horizontalBarData = barData.map(({x, y}) => ({ x: y, y: x }))
						var horizontalGroupedBarData = groupedBarData.map(d => {
								return {
									y: d.x,
									x1: d.y1,
									x2: d.y2,
									x3: d.y3,
									x4: d.y4,
								}
							});

						renderPage(MSFT, MSFTFull, compareData, bubbleData, barData, groupedBarData, horizontalBarData, horizontalGroupedBarData);
						// renderPartialPage(MSFT, MSFTFull, compareData, bubbleData, barData, groupedBarData, horizontalBarData);
					});
				});
			});
		});
	});
});

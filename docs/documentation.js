"use strict";

var React = require("react");
// var ReactDOM = require("react-dom");
var d3 = require("d3");
var parseDate = d3.time.format("%Y-%m-%d").parse

require("stylesheets/stock-charts");

var Nav = require("lib/navbar");
var MainContainer = require("lib/main-container");
var Sidebar = require("lib/sidebar");
var MenuGroup = require("lib/menu-group");
var MenuItem = require("lib/MenuItem");


var pages = [
	require("lib/page/GettingStartedPage"),
	require("lib/page/AreaChartPage"),
	require("lib/page/CandleStickChartPage"),
];

function compressString(string) {
	string = string.replace(/\s+/g, "_");
	string = string.replace(/[-&]/g, "_");
	string = string.replace(/_+/g, "_");
	string = string.toLowerCase();
	// console.log(string);
	return string
}

function renderPage(data, dataFull, compareData){
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
								<MenuGroup>
									{pages.map((eachPage, idx) => <MenuItem key={idx} current={eachPage === this.state.selectedPage} title={eachPage.title} anchor={compressString(eachPage.title)} />)}
								</MenuGroup>
							</Sidebar>
							<Page someData={data} lotsOfData={dataFull} compareData={compareData} />
						</MainContainer>
					</div>
				);
			}
	};

	React.render(<ExamplesPage />, document.getElementById("chart-goes-here"));
}

d3.tsv("data/MSFT.tsv", (err, MSFT) => {
	d3.tsv("data/MSFT_full.tsv", (err2, MSFTFull) => {
		d3.tsv("data/comparison.tsv", (err3, compareData) => {
			renderPage(MSFT, MSFTFull, compareData);
			// renderPartialPage(MSFT, MSFTFull, compareData);
		});
	});
});

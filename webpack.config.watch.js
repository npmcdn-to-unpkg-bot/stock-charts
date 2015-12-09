var config = require("./webpack.config.js");

var path = require("path");

/*config.devServer = {
	contentBase: __dirname,
	port: 8090,
};

config.output.publicPath = "http://localhost:" + config.devServer.port + "/" + config.output.publicPath;
*/

config.externals = {
	"d3": "d3"
} // removing React & ReactDOM, for testing

module.exports = config;

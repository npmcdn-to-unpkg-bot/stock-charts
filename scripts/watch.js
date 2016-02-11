var webpack = require("webpack");
var WebpackDevServer = require("webpack-dev-server");
var webpackConfig = require("../webpack.config.watch.js");
var watchConfig = Object.create(webpackConfig);

var watchCompiler = webpack(watchConfig);

var serveStatic = require("serve-static")
// Start a webpack-dev-server
var server = new WebpackDevServer(watchCompiler, {
	publicPath: watchConfig.output.publicPath,
	hot: true,
	inline: true,
	contentBase: watchConfig.devServer.contentBase,
	quiet: false,
	noInfo: false,
	watchOptions: {
		aggregateTimeout: 300,
		poll: 1000
	},
	stats: {
		colors: true
	}
});

server.listen(watchConfig.devServer.port, "localhost", function(err) {
	if (err) throw new Error("webpack-dev-server", err);
	console.log("[webpack-dev-server]", "http://localhost:" + watchConfig.devServer.port + "/index.html");
});

server.app.use(serveStatic("build"));
server.app.use(serveStatic("node_modules"));

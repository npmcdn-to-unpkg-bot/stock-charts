var webpack = require("webpack");
var path = require("path");

module.exports = {
	context: __dirname,
	entry: {
		app: "./src/index.js" //define with chunk name.
	},
	output: {
		path: path.join(__dirname, "build/dist/"), // Path of the output
		filename: "stock-charts.js", // filename
		publicPath: "dist/", //CDN
		library: "ReStock", // Export as library
		libraryTarget: "umd", // AMD export.
	},
	debug: true,
	devtool: "sourcemap",
	module: {
		loaders: [
			{
				test: /\.json$/,
				loader: "json"
			},
			{
				test: /\.(js|jsx)$/,
				loader: "babel",
				exclude: /node_modules/,
				query:
				{
					cacheDirectory: true,
					presets: ['es2015', 'react']
				}
			}
		]
	},
	plugins: [
		new webpack.NoErrorsPlugin(),
	],
	externals: {
		"react": "React",
		"react-dom": "ReactDOM",
		"d3": "d3",
	},
	resolve: {
		// root: [__dirname, path.join(__dirname, "src"), path.join(__dirname, "docs")],
		/* alias: {
			"react-dom": "react/lib/ReactDOM"
		}, */
		extensions: ["", ".js", ".jsx", ".scss", ".md"]
	}
};

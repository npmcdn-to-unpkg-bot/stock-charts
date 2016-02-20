'use strict';

var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
	debug: true,
	devtool: "sourcemap",
	entry: [
		'webpack-hot-middleware/client?reload=true',
		path.join(__dirname, 'docs/index.js')
	],
	output: {
		path: path.join(__dirname, '/dist'),
		filename: 'stock-charts-home.js',
		publicPath: '/'
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: 'docs/tpl/index.tpl.html',
			inject: 'body',
			filename: 'index.html'
		}),
		new CopyWebpackPlugin([
			{ from: path.join(__dirname, 'docs/data') , to: 'data'}
		]),
		new webpack.optimize.OccurenceOrderPlugin(),
    	new webpack.HotModuleReplacementPlugin(),
    	new webpack.NoErrorsPlugin()
	],
	module: {
		loaders: [
			{ test: /\.json$/, loader: "json" },
			{ test: /\.(js|jsx)$/, loader: "babel", exclude: /node_modules/, query: { cacheDirectory: true, presets: ['es2015', 'react'] } },
			{ test: /\.jpg$/, loader: "file-loader" },
			{ test: /\.png$/, loader: "url-loader?mimetype=image/png" },
			{ test: /\.md/, loaders: ["html", "remarkable"] },
			{ test: /\.scss$/, loaders: ["style", "css", "autoprefixer", "sass?outputStyle-expanded"] }
		]
	},
	resolve: {
		root: [__dirname, path.join(__dirname, "docs")],
		 alias: {
			"react-stockcharts": path.join(__dirname, "src")
		},
		extensions: ["", ".js", ".jsx", ".scss", ".md"]
	}
};

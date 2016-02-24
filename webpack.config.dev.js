'use strict';

var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
	debug: true,
	devtool: "sourcemap",
/*	entry: [
		'webpack-hot-middleware/client?reload=true',
		path.join(__dirname, 'docs/index.js'),
		path.join(__dirname, 'docs/documentation.js')
	],*/
	entry: {
		"stock-charts-home": [path.join(__dirname, 'docs/index.js'), 'webpack-hot-middleware/client?reload=true'],
		"stockcharts-documentation": [path.join(__dirname, 'docs/documentation.js'), 'webpack-hot-middleware/client?reload=true']
	},
	output: {
		path: path.join(__dirname, '/dist'),
		filename: '[name].js',
		publicPath: '/'
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: 'docs/tpl/index.tpl.html',
			inject: 'body',
			filename: 'index.html'
		}),
		new HtmlWebpackPlugin({
			template: 'docs/tpl/documentation.tpl.html',
			inject: 'body',
			filename: 'documentation.html',
			chunks: ['stockcharts-documentation']
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

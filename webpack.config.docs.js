var path = require("path");

var myConfig = require("./webpack.config.js");

myConfig.output.filename = "[name].js";

myConfig.module

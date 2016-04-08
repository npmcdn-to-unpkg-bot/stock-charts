"use strict";

import React from "react";
import d3 from "d3";
import flattenDeep from "lodash.flattendeep";

import Chart from "../Chart";
import EventCapture from "../EventCapture";

import {
    isObject,
    isDefined,
    zipper,
}
from "./index";

import {
    firstDefined, lastDefined
}
from "./OverlayUtils"
import ScaleUtils from "../utils/ScaleUtils";

export function getDimensions({ width, height }, chartProps) {

    var chartWidth = (chartProps.width || width);
    var chartHeight = (chartProps.height || height);

    return {
        availableWidth: width,
        availableHeight: height,
        width: chartWidth,
        height: chartHeight
    };
};

function values(func) {
    return (d) => {
        var obj = func(d);
        return isObject(obj) ? Object.keys(obj).map(key => obj[key]) : obj;
    };
};

export function shouldShowCrossHairStyle(children) {
    return React.Children.map(children, (each) => {
        if (each.type === EventCapture) {
            return each.props.useCrossHairStyle;
        }
        return undefined;
    }).filter(isDefined)[0];
}

export function getNewChartConfig(innerDimension, children) {
    return React.Children.map(children, (each) => {
        if (each.type === Chart) {
            var { id, origin, padding, yExtents: yExtentsProp, yScale, flipYScale } = each.props;
            var { width, height, availableWidth, availableHeight } = getDimensions(innerDimension, each.props);
            var { yMousePointerDisplayLocation: at, yMousePointerDisplayFormat: yDisplayFormat } = each.props;
            var { yMousePointerRectWidth: rectWidth, yMousePointerRectHeight: rectHeight } = each.props;
            var mouseCoordinates = { at, yDisplayFormat, rectHeight, rectWidth };
            var yExtents = (Array.isArray(yExtentsProp) ? yExtentsProp : [yExtentsProp]).map(d3.functor);
            // console.log(yExtentsProp, yExtents);
            return {
                id,
                origin: d3.functor(origin)(availableWidth, availableHeight),
                padding,
                yExtents,
                flipYScale,
                yScale,
                mouseCoordinates,
                width,
                height
            };
        }
        return undefined;
    }).filter(each => isDefined(each));
}

export function getChartConfigWithUpdatedYScales(chartConfig, plotData) {

    var yDomains = chartConfig
            .map(({ yExtents, yScale }) => {
                var yValues = yExtents.map(eachExtent =>
                    plotData.map(values(eachExtent)));
                yValues = flattenDeep(yValues);

                var yDomains = (yScale.invert)
                    ? d3.extent(yValues)
                    : d3.set(yValues).values();

                return yDomains;
            });

    var combine = zipper()
        .combine((config, domain) => {
            var { padding, height, yScale, flipYScale } = config;

            return { ...config, yScale: setRange(yScale.copy().domain(domain), height, padding, flipYScale) };
            // return { ...config, yScale: yScale.copy().domain(domain).range([height - padding, padding]) };
        });

    var updatedChartConfig = combine(chartConfig, yDomains);
    return updatedChartConfig;
};

export function getChartDataConfig(props, innerDimensions, other) {
    var charts = getCharts(props);
    return charts.map((each) => ({
        id: each.props.id,
        config: getChartConfigFor(innerDimensions, each.props, other),
    }));
};

function setRange(scale, height, padding, flipYScale) {
    if (scale.rangeRoundPoints) {
        if (isNaN(padding)) throw new Error("padding has to be a number for ordinal scale");
        scale.rangeRoundPoints(flipYScale ? [0, height] : [height, 0], padding);
    } else {
        var { top, bottom } = isNaN(padding)
            ? padding
            : { top: padding, bottom: padding };

        scale.range(flipYScale ? [top, height - bottom] : [height - bottom, top]);
    }
    return scale;
}

export function getChartData(props, innerDimensions, partialData, fullData, other, domainL, domainR) {
    var charts = getCharts(props);

    return charts.map((each) => {
        var chartProps = each.props;

        var config = getChartConfigFor(innerDimensions, chartProps, other);
        calculateOverlays(fullData, config.overlays);
        var scaleType = defineScales(chartProps, partialData, other);

        var plot = getChartPlotFor(config, scaleType, partialData, domainL, domainR);

        return {
            id: each.props.id,
            config: config,
            scaleType: scaleType,
            plot: plot,
        };
    });
};

export function calculateOverlays(fullData, overlays) {
    if (Array.isArray(fullData)) {
        overlays
            .filter((eachOverlay) => eachOverlay.id !== undefined)
            .forEach((overlay) => {
                overlay.indicator.calculate(fullData);
            });
    } else {
        Object.keys(fullData)
            .filter((key) => ["D", "W", "M"].indexOf(key) > -1)
            .forEach((key) => {
                overlays
                    .filter((eachOverlay) => eachOverlay.indicator !== undefined)
                    .forEach((overlay) => {
                        overlay.indicator.calculate(fullData[key]);
                    });
            });
    }
    // console.table(fullData.M);
    // console.log(overlays);
};

export function getChartConfigFor(innerDimension, chartProps, other) {
    var {
        padding
    } = chartProps;
    var dimensions = getDimensions(innerDimension, chartProps);

    var xAccessor = getXAccessor(chartProps, other);
    var overlaysToAdd = identifyOverlaysToAdd(chartProps);
    var compareBase = identifyCompareBase(chartProps);
    var compareSeries = identifyCompareSeries(chartProps);

    //Calculate overlays TODO

    var origin = typeof chartProps.origin === "function" ? chartProps.origin(dimensions.availableWidth, dimensions.availableHeight) : chartProps.origin;

    var indicatorsWithTicks = overlaysToAdd
        .filter(overlay => overlay.indicator !== undefined)
        .filter(overlay => overlay.indicator.yTicks !== undefined);

    var yTicks;
    if (indicatorsWithTicks.length > 0) {
        yTicks = indicatorsWithTicks.map(overlay => overlay.indicator.yTicks())
            .reduce((ticks1, ticks2) => ticks1.concat(ticks2));
    }

    var config = {
        width: dimensions.width,
        height: dimensions.height,
        mouseCoordinates: {
            at: chartProps.yMousePointerDisplayLocation,
            format: chartProps.yMousePointerDisplayFormat
        },
        // indicator: indicator,
        // indicatorOptions: indicator && indicator.options(),
        // domain: indicator && indicator.domain && indicator.domain(),
        origin: origin,
        padding: padding,
        xAccessor: xAccessor,
        overlays: overlaysToAdd,
        compareBase: compareBase,
        compareSeries: compareSeries,
        // scaleType: scales,
        yTicks: yTicks,
    };
    return config;
};

export function getDataToPlotForDomain(domainL, domainR, data, width, xAccessor) {
    var threshold = 0.5; // number of datapoints per 1 px
    var allowedIntervals = ["D", "W", "M"];
    // console.log(domainL, domainR, data, width);

    var dataForInterval, filteredData, interval, leftIndex, rightIndex;

    for (var i = 0; i < allowedIntervals.length; i++) {
        if (!data[allowedIntervals[i]]) continue;
        interval = allowedIntervals[i];
        dataForInterval = data[interval];

        leftIndex = getClosestItemIndexes(dataForInterval, domainL, xAccessor).left;
        rightIndex = getClosestItemIndexes(dataForInterval, domainR, xAccessor).right;

        // leftIndex = leftX.left;
        // rightIndex = rightX.right;

        filteredData = dataForInterval.slice(leftIndex, rightIndex);

        // console.log(filteredData.length, width * threshold);
        if (filteredData.length < width * threshold) break;
    }

    // console.log(leftX, rightX,  (dd[leftX.left]), xAccessor(dd[rightX.right]));

    return {
        interval: interval,
        data: filteredData,
        leftIndex: leftIndex,
        rightIndex: rightIndex
    };
};


export function getXAccessor(props, passThroughProps) {
    var xAccessor = passThroughProps !== undefined && passThroughProps.xAccessor || props.xAccessor !== undefined && props.xAccessor;
    return xAccessor;
};

export function identifyOverlaysToAdd(chartProps) {
    var overlaysToAdd = [];
    React.Children.forEach(chartProps.children, (child) => {
        if (React.isValidElement(child) && /DataSeries$/.test(child.props.namespace)) {
            var {
                yAccessor
            } = child.props;
            var indicatorProp = child.props.indicator;
            if (yAccessor === undefined && indicatorProp === undefined) {
                console.error(`Either have yAccessor or indicator which provides a yAccessor for Chart ${ chartProps.id } DataSeries ${ child.props.id }`);
            }
            var indicator = indicatorProp !== undefined ? indicatorProp(child.props.options, chartProps, child.props) : undefined;
            var {
                stroke, fill
            } = child.props;
            if (stroke === undefined && indicator !== undefined && indicator.stroke !== undefined) stroke = indicator.stroke();
            if (fill === undefined && indicator !== undefined && indicator.fill !== undefined) fill = indicator.fill();
            var overlay = {
                id: child.props.id,
                chartId: chartProps.id,
                yAccessor: yAccessor || indicator.yAccessor(),
                indicator: indicator,
                stroke: stroke,
                fill: fill,
                // stroke: indicator.options().stroke || overlayColors(child.props.id)
            };
            // console.error(overlay.id, overlay.chartId, overlay.stroke, indicator);
            overlaysToAdd.push(overlay);
        }
    });
    return overlaysToAdd;
};

export function identifyCompareBase(props) {
    var compareBase;
    React.Children.forEach(props.children, (child) => {
        if (React.isValidElement(child) && /DataSeries$/.test(child.props.namespace)) {
            compareBase = child.props.compareBase;
        }
    });
    return compareBase;
};

export function identifyCompareSeries(props) {
    var overlaysToAdd = [];
    React.Children.forEach(props.children, (child) => {
        if (React.isValidElement(child) && /DataSeries$/.test(child.props.namespace)) {
            React.Children.forEach(child.props.children, (grandChild) => {
                if (React.isValidElement(grandChild) && /CompareSeries$/.test(grandChild.props.namespace)) {
                    overlaysToAdd.push({
                        yAccessor: grandChild.props.yAccessor,
                        id: grandChild.props.id,
                        stroke: grandChild.props.stroke || overlayColors(grandChild.props.id),
                        displayLabel: grandChild.props.displayLabel,
                        percentYAccessor: (d) => d.compare["compare_" + grandChild.props.id],
                    });
                }
            });
        }
    });
    return overlaysToAdd;
};

export function getChildren(children, regex) {
    var matchingChildren = [];
    React.Children.forEach(children, (child) => {
        if (React.isValidElement(child) && regex.test(child.props.namespace)) matchingChildren.push(child);
    });
    return matchingChildren;
};

export function getMainChart(children) {
    var eventCapture = getChildren(children, /EventCapture$/);
    if (eventCapture.length > 1) throw new Error("only one EventCapture allowed");
    if (eventCapture.length > 0) return eventCapture[0].props.mainChart;
    if (eventCapture.length == 0) return getChildren(children, /Chart$/)[0].props.id;
};

export function getChartPlotFor(config, scaleType, partialData, domainL, domainR) {
    var yaccessors = pluck(keysAsArray(config.overlays), "yAccessor");
    // console.log(yaccessors);
    if (config.compareSeries.length > 0) {
        updateComparisonData(partialData, config.compareBase, config.compareSeries);
        yaccessors = [(d) => d.compare];
    }
    var xyValues = ScaleUtils.flattenData(partialData, [config.xAccessor], yaccessors);

    var overlayValues = updateOverlayFirstLast(partialData, config.overlays);
    var indicators = pluck(keysAsArray(config.overlays), "indicator");
    var domains = indicators
        .filter(indicator => indicator !== undefined)
        .filter(indicator => indicator.domain !== undefined)
        .map(indicator => indicator.domain());

    var domain;
    if (domains.length > 0) {
        domain = domains.reduce((a, b) => {
            return [Math.min(a[0], b[0]), Math.max(a[1], b[1])];
        });
    }

    var scales = updateScales(
        xyValues,
        scaleType,
        partialData,
        config.width,
        config.height,
        config.padding,
        domain);

    if (domainL !== undefined && domainR !== undefined) {
        scales.xScale.domain([domainL, domainR]);
    }

    var plot = {
        overlayValues: overlayValues,
        scales: scales,
    };
    return plot;
};

export function updateScales(xyValues, scales, data, width, height, padding, overrideDomain) {
    // console.log("updateScales");
    // width = width - margin.left - margin.right/**/
    // height = height - margin.top - margin.bottom/**/

    scales.xScale.range([padding.left, width - padding.right]);
    // if polylinear scale then set data
    if (scales.xScale.isPolyLinear && scales.xScale.isPolyLinear()) {
        scales.xScale.data(data);
    } else {
        // else set the domain
        scales.xScale.domain(d3.extent(xyValues.xValues));
    }

    scales.yScale.range([height - padding.top, padding.bottom]);

    if (overrideDomain !== undefined) {
        scales.yScale.domain(overrideDomain);
    } else {
        var domain = d3.extent(xyValues.yValues);
        scales.yScale.domain(domain);
    }

    return {
        xScale: scales.xScale.copy(),
        yScale: scales.yScale.copy()
    };
};

export function identifyCompareBase(props) {
    var compareBase;
    React.Children.forEach(props.children, (child) => {
        if (React.isValidElement(child) && /DataSeries$/.test(child.props.namespace)) {
            compareBase = child.props.compareBase;
        }
    });
    return compareBase;
};

export function identifyCompareSeries(props) {
    var overlaysToAdd = [];
    return overlaysToAdd;
};

export function defineScales(props, data, passThroughProps) {
    var xScale = props.xScale,
        yScale = props.yScale;

    if (xScale === undefined && passThroughProps) xScale = passThroughProps.xScale;

    if (xScale === undefined) {
        var each = data[0];
        if (typeof each === "object") {
            Object.keys(each).forEach((key) => {
                if (Object.prototype.toString.call(each[key]) === "[object Date]") {
                    xScale = d3.time.scale();
                }
            });
        }
        if (xScale === undefined) xScale = d3.scale.linear();
    }
    if (yScale === undefined) {
        yScale = d3.scale.linear();
    }
    return {
        xScale: xScale,
        yScale: yScale
    };
};

export function getChartOrigin(origin, contextWidth, contextHeight) {
    var originCoordinates = typeof origin === "function" ? origin(contextWidth, contextHeight) : origin;
    return originCoordinates;
};

export function updateOverlayFirstLast(data, overlays) {
    // console.log("updateOverlayFirstLast");
    var overlayValues = [];

    overlays
        .forEach((eachOverlay) => {
            // console.log(JSON.stringify(first), Object.keys(first), yAccessor(first));
            overlayValues.push({
                id: eachOverlay.id,
                first: firstDefined(data, eachOverlay.yAccessor),
                last: lastDefined(data, eachOverlay.yAccessor),
            });
        });
    return overlayValues;
};

export function getCurrentItems(chartData, mouseXY, plotData) {
	return chartData
		.map((eachChartData) => {
			var xValue = eachChartData.plot.scales.xScale.invert(mouseXY[0]);
			var item = getClosestItem(plotData, xValue, eachChartData.config.xAccessor);
			return { id: eachChartData.id, data: item };
		});
};

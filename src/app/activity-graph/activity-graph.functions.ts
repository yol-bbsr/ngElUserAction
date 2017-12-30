import { state } from '@angular/animations';
import * as moment from 'moment';
import { D3, Selection } from 'd3-ng2-service';

export class ChartProperties {
    // top margin -> title and legend
    // right margin -> horizontal axis title
    // left maring -> y axis title
    public static margin = { top: 70, right: 40, bottom: 20, left: 100 };
    // height of horizontal data bars
    public static dataHeight = 8;
    // spacing between horizontal data bars
    public static lineSpacing = 8;
    // vertical space for heading
    public static paddingTopHeading = -50;
    // vertical overhang of vertical grid lines on bottom
    public static paddingBottom = 10;
    // space for y axis titles
    public static paddingLeft = -100;
    // global div for tooltip
    public tooltip: any;
    public svgElement: Selection<SVGSVGElement, any, null, undefined>;
    public width: number;
    // title of chart is drawn or not
    public drawTitle: boolean;
    // year ticks to be emphasized or not
    public emphasizeYearTicks: boolean;

    constructor(public d3ServiceRef: D3,
        private svgElementRef: Selection<SVGSVGElement, any, null, undefined>,
        private chartWidth?: number,
        private showTitle?: boolean,
        private showYearTicks?: boolean) {
        this.svgElement = svgElementRef;
        if (chartWidth !== undefined) {
            this.width = chartWidth - ChartProperties.margin.left - ChartProperties.margin.right;
        } else {
            this.width = 768 - ChartProperties.margin.left - ChartProperties.margin.right;
        }
        if (showTitle !== undefined) {
            this.drawTitle = showTitle;
        } else {
            this.drawTitle = true;
        }
        if (showYearTicks !== undefined) {
            this.emphasizeYearTicks = showYearTicks;
        } else {
            this.emphasizeYearTicks = true;
        }
        this.tooltip = this.d3ServiceRef.select('body').append('div').attr('class', 'tooltip').style('opacity', 0);
    }

}
export class ActivityChart {

    public static drawChart(selection, settings: ChartProperties) {
        let definedBlocks: boolean = null;
        let customCategories = null;
        let isDateOnlyFormat = null;
        selection.each((dataset) => {
            const height = ChartProperties.dataHeight * dataset.length + ChartProperties.lineSpacing * dataset.length - 1;
            // check how data is arranged
            if (definedBlocks === null) {
                definedBlocks = false;
                for (let i = 0; i < dataset.length; i++) {
                    if (dataset[i].data[0].length === 3) {
                        definedBlocks = true;
                        break;
                    } else {
                        if (definedBlocks) {
                            throw new Error('Detected different data formats in input data. Format can either be ' +
                                'continuous data format or time gap data format but not both.');
                        }
                    }
                }
            }
            // check if data has custom categories
            if (customCategories === null) {
                customCategories = 0;
                for (let i = 0; i < dataset.length; i++) {
                    if (dataset[i].data[0][1] !== 0 && dataset[i].data[0][1] !== 1) {
                        customCategories = 1;
                        break;
                    }
                }
            }
            // parse data text strings to JavaScript date stamps
            const parseDate = settings.d3ServiceRef.timeParse('%Y-%m-%d');
            const parseDateTime = settings.d3ServiceRef.timeParse('%Y-%m-%d %H:%M:%S');
            const parseDateRegEx = new RegExp(/^\d{4}-\d{2}-\d{2}$/);
            const parseDateTimeRegEx = new RegExp(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
            if (isDateOnlyFormat === null) {
                isDateOnlyFormat = true;
            }
            dataset.forEach(function (d) {
                d.data.forEach(function (d1) {
                    if (!(d1[0] instanceof Date)) {
                        if (parseDateRegEx.test(d1[0])) {
                            // d1[0] is date without time data
                            d1[0] = parseDate(d1[0]);
                        } else if (parseDateTimeRegEx.test(d1[0])) {
                            // d1[0] is date with time data
                            d1[0] = parseDateTime(d1[0]);
                            isDateOnlyFormat = false;
                        } else {
                            console.log(d1);
                            throw new Error('Date/time format not recognized. Pick between YYYY-MM-DD or YYYY-MM-DD HH:MM:SS.');
                        }
                        if (!definedBlocks) {
                            d1[2] = settings.d3ServiceRef.timeSecond.offset(d1[0], d.interval_s);
                        } else {
                            if (parseDateRegEx.test(d1[2])) {
                                // d1[2] is date without time data
                                d1[2] = parseDate(d1[2]);
                            } else if (parseDateTimeRegEx.test(d1[2])) {
                                // d1[2] is date with time data
                                d1[2] = parseDateTime(d1[2]);
                            } else {
                                throw new Error('Date/time format not recognized. Pick between YYYY-MM-DD or YYYY-MM-DD HH:MM:SS.');
                            }
                        }
                    }
                });
            });
            // cluster data by dates to form time blocks
            dataset.forEach(function (series, seriesI) {
                const tmpData = [];
                const dataLength = series.data.length;
                series.data.forEach(function (d, i) {
                    if (i !== 0 && i < dataLength) {
                        if (d[1] === tmpData[tmpData.length - 1][1]) {
                            // the value has not changed since the last date
                            if (definedBlocks) {
                                if (tmpData[tmpData.length - 1][2].getTime() === d[0].getTime()) {
                                    // end of old and start of new block are the same
                                    tmpData[tmpData.length - 1][2] = d[2];
                                    tmpData[tmpData.length - 1][3] = 1;
                                } else {
                                    tmpData.push(d);
                                }
                            } else {
                                tmpData[tmpData.length - 1][2] = d[2];
                                tmpData[tmpData.length - 1][3] = 1;
                            }
                        } else {
                            // the value has changed since the last date
                            d[3] = 0;
                            if (!definedBlocks) {
                                // extend last block until new block starts
                                tmpData[tmpData.length - 1][2] = d[0];
                            }
                            tmpData.push(d);
                        }
                    } else if (i === 0) {
                        d[3] = 0;
                        tmpData.push(d);
                    }
                });
                dataset[seriesI].disp_data = tmpData;
            });

            // determine start and end dates among all nested datasets
            let startDate = 0;
            let endDate = 0;
            dataset.forEach(function (series, seriesI) {
                if (series.disp_data.length > 0) {
                    if (startDate === 0) {
                        startDate = series.disp_data[0][0];
                        endDate = series.disp_data[series.disp_data.length - 1][2];
                    } else {
                        if (series.disp_data[0][0] < startDate) {
                            startDate = series.disp_data[0][0];
                        }
                        if (series.disp_data[series.disp_data.length - 1][2] > endDate) {
                            endDate = series.disp_data[series.disp_data.length - 1][2];
                        }
                    }
                }
            });

            // define scales
            const xScale = settings.d3ServiceRef.scaleTime()
                .domain([startDate, endDate])
                .range([0, settings.width])
                .clamp(true);
            // define axes
            const xAxis = settings.d3ServiceRef.axisTop(xScale);

            // create SVG element
            const svg = settings.svgElement.append('svg')
                .attr('width', settings.width + ChartProperties.margin.left + ChartProperties.margin.right)
                .attr('height', height + ChartProperties.margin.top + ChartProperties.margin.bottom)
                .append('g').attr('transform', 'translate(' + ChartProperties.margin.left + ',' + ChartProperties.margin.top + ')');

            // create basic element groups
            svg.append('g').attr('id', 'g_title');
            svg.append('g').attr('id', 'g_axis');
            svg.append('g').attr('id', 'g_data');

            // create y axis labels
            const labels = svg.select('#g_axis').selectAll('text').data(dataset.slice(0, dataset.length)).enter();

            // text labels
            labels.append('text')
                .attr('x', ChartProperties.paddingLeft)
                .attr('y', ChartProperties.lineSpacing + ChartProperties.dataHeight / 2)
                .text((d: any) => { if (!(d.measure_html != null)) { return d.measure; } })
                .attr('transform', (d, i) => 'translate(0,' + ((ChartProperties.lineSpacing + ChartProperties.dataHeight) * i) + ')')
                .attr('class', (d: any) => { let returnCSSClass = 'ytitle'; if (d.measure_url != null) { returnCSSClass = returnCSSClass + ' link'; } return returnCSSClass; })
                .on('click', (d: any) => { if (d.measure_url != null) { return window.open(d.measure_url); } return null; });

            // HTML labels
            labels.append('foreignObject')
                .attr('x', ChartProperties.paddingLeft)
                .attr('y', ChartProperties.lineSpacing)
                .attr('transform', (d, i) => 'translate(0,' + ((ChartProperties.lineSpacing + ChartProperties.dataHeight) * i) + ')')
                .attr('width', -1 * ChartProperties.paddingLeft)
                .attr('height', ChartProperties.dataHeight)
                .attr('class', 'ytitle')
                .html((d: any) => { if (d.measure_html != null) { return d.measure_html; } });

            // create vertical grid
            svg.select('#g_axis').selectAll('line.vert_grid').data(xScale.ticks())
                .enter()
                .append('line')
                .attr('class', 'vert_grid')
                .attr('x1', d => xScale(d))
                .attr('x2', d => xScale(d))
                .attr('y1', 0)
                .attr('y2', ChartProperties.dataHeight * dataset.length + ChartProperties.lineSpacing * dataset.length - 1 + ChartProperties.paddingBottom);

            // create x axis
            svg.select('#g_axis').append('g')
                .attr('class', 'axis')
                .call(xAxis);

            // make y groups for different data series
            const g = svg.select('#g_data').selectAll('.g_data')
                .data(dataset.slice(0, dataset.length))
                .enter()
                .append('g')
                .attr('transform', (d, i) => 'translate(0,' + ((ChartProperties.lineSpacing + ChartProperties.dataHeight) * i) + ')')
                .attr('class', 'dataset');

            // add data series
            g.selectAll('rect')
                .data((d: any) => d.disp_data)
                .enter()
                .append('rect')
                .attr('x', (d) => xScale(d[0]))
                .attr('y', ChartProperties.lineSpacing)
                .attr('width', (d) => (xScale(d[2]) - xScale(d[0])))
                .attr('height', ChartProperties.dataHeight)
                .attr('class', function (d) {
                    if (customCategories) {
                        const series = dataset.find(serie => serie.disp_data.indexOf(d) >= 0);
                        if (series && series.categories) {
                            settings.d3ServiceRef.select(this).attr('fill', series.categories[d[1]].color);
                            return '';
                        }
                    } else {
                        if (d[1] === 1) {              // data available
                            return 'rect_has_data';
                        } else {                       // no data available
                            return 'rect_has_no_data';
                        }
                    }
                })
                .on('mouseover', function (d, i) {
                    const rect: any = this;
                    const matrix = rect.getScreenCTM().translate(+rect.getAttribute('x'), +rect.getAttribute('y'));
                    settings.tooltip.transition().duration(200).style('opacity', 0.9);
                    settings.tooltip.html(function () {
                        let output: string;
                        if (customCategories) {
                            // custom categories: display category name
                            output = '&nbsp;' + d[1] + '&nbsp;';
                        } else {
                            if (d[1] === 1) {
                                // transaction icon
                                output = '<i class="material-icons tooltip_has_data">directions_run</i>';
                            } else {
                                // pacing icon
                                output = '<i class="material-icons tooltip_has_no_data">airline_seat_individual_suite</i>';
                            }
                        }
                        if (isDateOnlyFormat) {
                            if (d[2] > settings.d3ServiceRef.timeSecond.offset(d[0], 86400)) {
                                return output + moment(d[0]).format('l')
                                    + ' - ' + moment(d[2]).format('l');
                            }
                            return output + moment(parseDate(d[0])).format('l');
                        } else {
                            if (d[2] > settings.d3ServiceRef.timeSecond.offset(d[0], 86400)) {
                                return output + moment(d[0]).format('l') + ' '
                                    + moment(d[0]).format('LTS') + ' - '
                                    + moment(d[2]).format('l') + ' '
                                    + moment(d[2]).format('LTS');
                            }
                            return output + moment(d[0]).format('HH:mm:ss') + ' - '
                                + moment(d[2]).format('HH:mm:ss');
                        }
                    })
                        .style('left', () => window.pageXOffset + matrix.e + 'px')
                        .style('top', () => window.pageYOffset + matrix.f - 11 + 'px')
                        .style('height', ChartProperties.dataHeight + 11 + 'px');
                })
                .on('mouseout', function () {
                    settings.tooltip.transition()
                        .duration(500)
                        .style('opacity', 0);
                });

            // rework ticks and grid for better visual structure

            const xTicks = xScale.ticks();
            const isYearTick = xTicks.map(t => +t === +(new Date(t.getFullYear(), 0, 1, 0, 0, 0)));
            const isMonthTick = xTicks.map(t => +t === +(new Date(t.getFullYear(), t.getMonth(), 1, 0, 0, 0)));
            // year emphasis
            // ensure year emphasis is only active if years are the biggest clustering unit
            if (settings.emphasizeYearTicks
                && !(isYearTick.every(function (d) { return d === true; }))
                && isMonthTick.every(function (d) { return d === true; })) {
                settings.d3ServiceRef.selectAll('g.tick').each(function (d, i) { if (isYearTick[i]) { settings.d3ServiceRef.select(this).attr('class', 'x_tick_emph'); } });
                settings.d3ServiceRef.selectAll('.vert_grid').each(function (d, i) { if (isYearTick[i]) { settings.d3ServiceRef.select(this).attr('class', 'vert_grid_emph'); } });
            }

            // create title
            if (settings.drawTitle) {
                svg.select('#g_title')
                    .append('text')
                    .attr('x', ChartProperties.paddingLeft)
                    .attr('y', ChartProperties.paddingTopHeading)
                    .text('Virtual User Activity')
                    .attr('class', 'heading');
            }

            // create legend
            if (!customCategories) {
                const legend = svg.select('#g_title')
                    .append('g')
                    .attr('id', 'g_legend')
                    .attr('transform', 'translate(0,-12)');

                legend.append('rect')
                    .attr('x', settings.width + ChartProperties.margin.right - 150)
                    .attr('y', ChartProperties.paddingTopHeading)
                    .attr('height', 15)
                    .attr('width', 15)
                    .attr('class', 'rect_has_data');

                legend.append('text')
                    .attr('x', settings.width + ChartProperties.margin.right - 150 + 20)
                    .attr('y', ChartProperties.paddingTopHeading + 8.5)
                    .text('Transaction')
                    .attr('class', 'legend');

                legend.append('rect')
                    .attr('x', settings.width + ChartProperties.margin.right - 150)
                    .attr('y', ChartProperties.paddingTopHeading + 17)
                    .attr('height', 15)
                    .attr('width', 15)
                    .attr('class', 'rect_has_no_data');

                legend.append('text')
                    .attr('x', settings.width + ChartProperties.margin.right - 150 + 20)
                    .attr('y', ChartProperties.paddingTopHeading + 8.5 + 15 + 2)
                    .text('Pacing')
                    .attr('class', 'legend');
            }
        });
    }
}

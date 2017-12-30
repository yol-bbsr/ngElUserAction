import { Component, OnInit, Input, ElementRef, OnChanges, OnDestroy, Renderer2, ViewChild } from '@angular/core';

import { D3Service, D3, D3DragEvent, D3ZoomEvent, Selection } from 'd3-ng2-service';

import { TransactionDetails } from './user-configuration/user-configuration.model';
import { AfterViewInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { ActivityChart, ChartProperties } from './activity-graph.functions';

@Component({
  selector: 'app-activity-graph',
  templateUrl: './activity-graph.component.html',
  styleUrls: ['./activity-graph.component.scss']
})
export class ActivityGraphComponent implements OnInit, OnDestroy {

  private transactionModel: TransactionDetails;
  private d3: D3;
  private chartContainer: Selection<SVGSVGElement, any, null, undefined>;
  private chartRef: ChartProperties;
  @ViewChild('graphcontainer') el: ElementRef;

  constructor(private renderrer: Renderer2, element: ElementRef, d3Service: D3Service) {
    this.d3 = d3Service.getD3();
  }

  ngOnInit() {
    let d3ParentElement: Selection<HTMLElement, any, null, undefined>;
    if (this.el !== null) {
      d3ParentElement = this.d3.select(this.el.nativeElement);
      this.chartContainer = d3ParentElement.select<SVGSVGElement>('p');
      this.chartContainer.attr('width', '100%').attr('height', 400);
      this.chartRef = new ChartProperties(this.d3, this.chartContainer, this.el.nativeElement.offsetWidth);
    }
  }

  onSimulation($event) {
    this.clearChart();
    this.chartContainer.datum($event.activites).call(ActivityChart.drawChart, this.chartRef);
    this.chartContainer.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('height', '100%')
      .attr('width', '100%')
      .style('stroke', 'black')
      .style('fill', 'none')
      .style('stroke-width', '5px');
  }

  ngOnDestroy() {
    this.clearChart();
  }

  private clearChart() {
    if (this.chartContainer.empty && !this.chartContainer.empty()) {
      this.chartContainer.selectAll('*').remove();
    }
  }
}

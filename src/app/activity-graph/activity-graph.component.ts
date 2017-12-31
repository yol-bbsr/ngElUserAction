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
  private stepChartContainer: Selection<SVGSVGElement, any, null, undefined>;
  private chartRef: ChartProperties;
  private stepChartRef: ChartProperties;
  public displayStep = false;
  @ViewChild('graphcontainer') el: ElementRef;
  @ViewChild('stepgraphcontainer') step: ElementRef;

  constructor(private renderrer: Renderer2, d3Service: D3Service) {
    this.d3 = d3Service.getD3();
  }

  ngOnInit() {
    let d3ParentElement: Selection<HTMLElement, any, null, undefined>;
    if (this.el !== null) {
      d3ParentElement = this.d3.select(this.el.nativeElement);
      this.chartContainer = d3ParentElement.select<SVGSVGElement>('p');
      this.chartRef = new ChartProperties(this.d3, this.chartContainer, this.el.nativeElement.offsetWidth, false);
    }
    if (this.step !== undefined) {
      d3ParentElement = this.d3.select(this.step.nativeElement);
      this.stepChartContainer = d3ParentElement.select<SVGSVGElement>('p');
      this.stepChartRef = new ChartProperties(this.d3, this.stepChartContainer, this.step.nativeElement.offsetWidth, false);
    }
  }

  onSimulation($event) {
    this.clearChart();
    this.chartContainer.attr('width', '100%');
    this.chartContainer.datum($event.data.activites).call(ActivityChart.drawChart, this.chartRef);
    if ($event.settings.isSimulateSteps) {
      this.displayStep = true;
      this.stepChartContainer.attr('width', '100%');
      this.stepChartContainer.datum($event.data.setpActivities).call(ActivityChart.drawChart, this.stepChartRef);
    }
  }

  ngOnDestroy() {
    this.clearChart();
  }

  private clearChart() {
    this.displayStep = false;
    if (this.chartContainer.empty && !this.chartContainer.empty()) {
      this.chartContainer.selectAll('*').remove();
    }
    if (this.stepChartContainer !== undefined && this.stepChartContainer.empty && !this.stepChartContainer.empty()) {
      this.stepChartContainer.selectAll('*').remove();
    }
  }
}

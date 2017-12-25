import { Component, OnInit, Input } from '@angular/core';
import { TransactionDetails } from './user-configuration/user-configuration.model';

@Component({
  selector: 'app-activity-graph',
  templateUrl: './activity-graph.component.html',
  styleUrls: ['./activity-graph.component.scss']
})
export class ActivityGraphComponent implements OnInit {

  transactionModel: TransactionDetails;

  constructor() { }

  ngOnInit() {
  }

  onSimulation($event) {
    console.log($event);
    // TODO: update the visavail graph

    /**
   * Draw graph -- move to the component
  
  function draw_visavail() {
  chart = visavailChart();
  chart.width($('#visavail_container').width()-60);
  $('#graph').text('');
  d3.select("#graph").datum(dataset).call(chart);
  }
  */
  }
}

import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';

import { MatTableDataSource, MatSnackBar } from '@angular/material';
import { SelectionModel, DataSource } from '@angular/cdk/collections';
import { DragulaService } from 'ng2-dragula/ng2-dragula';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import { ThreadGroup, Scenario, Step, TransactionDetails } from './user-configuration.model';
import { getDataset } from './user-configuration.functions';

@Component({
  selector: 'app-user-configuration',
  templateUrl: './user-configuration.component.html',
  styleUrls: ['./user-configuration.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('expanded', style({ height: '*', visibility: 'visible' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class UserConfigurationComponent implements OnInit {
  panelOpenState = true;
  expandedElement: any;

  @Output() simulateEvent = new EventEmitter<TransactionDetails>();
  transactionDetails: TransactionDetails;
  totalvUsers: number;
  exeDuration: string;
  iteration: number;

  displayedColumns = ['select', 'THREADS', 'DELAY', 'START', 'HOLD', 'SHUTDOWN'];
  threadGroups: ThreadGroup[];
  dataSource: MatTableDataSource<ThreadGroup>;
  selection: SelectionModel<ThreadGroup>;

  constructor(private dragula: DragulaService, public snackBar: MatSnackBar) {
    this.dragula.setOptions('Steps-bag', { revertOnSpill: true });
  }

  ngOnInit() {
    this.threadGroups = [];
    this.threadGroups.push({ threads: 12, delay: 0, startup: 900, hold: 1800, shutdown: 900, scenario: this.defaultScenario() });
    this.dataSource = new MatTableDataSource<ThreadGroup>();
    this.selection = new SelectionModel<ThreadGroup>(true, []);
    this.rePaint();
    this.simulateEvent.emit(this.transactionDetails);
  }

  defaultScenario() {
    const transaction: Step[] = [];
    transaction.push({ name: 'Step 1', responseTime: 690, thinkTime: 10 });
    const scenario: Scenario = { name: 'Scenario ' + (this.threadGroups.length + 1), responseTime: 700, pacing: 200, steps: transaction };
    return scenario;
  }

  rePaint() {
    this.dataSource.data = this.threadGroups;
    this.selection.clear();
    // calculate the total values for display
    this.transactionDetails = getDataset(this.threadGroups);
    this.totalvUsers = this.transactionDetails.totalVusers;
    this.exeDuration = this.transactionDetails.totalDuration;
    this.iteration = this.transactionDetails.totalIteration;
  }

  onAddScenario() {
    this.threadGroups.push({ threads: 10, delay: 10, startup: 10, hold: 3600, shutdown: 10, scenario: this.defaultScenario() });
    this.rePaint();
  }

  onDeleteScenario() {
    this.selection.selected.forEach(element => this.threadGroups = this.threadGroups.filter(item => item !== element));
    this.rePaint();
  }

  onAddStep(element: ThreadGroup, index: number) {
    const newStep = { name: 'Step ' + (element.scenario.steps.length + 1), responseTime: 5, thinkTime: 5 };
    element.scenario.steps.splice(index + 1, 0, newStep);
    this.snackBar.open('Step added successfully!', 'Okay', { duration: 10000, });
  }

  onRemoveStep(element, index: number) {
    if (element.scenario.steps.length === 1) {
      this.snackBar.open('Step not removed. Atleast one required!', 'Okay', { duration: 10000, panelClass: 'warning'});
      return;
    }
    // show confirmation dialog
    element.scenario.steps.splice(index, 1);
    this.snackBar.open('Step removed successfully!', 'Okay', { duration: 10000, });
  }

  onSimulate() {
    this.panelOpenState = false;
    this.rePaint();
    this.simulateEvent.emit(this.transactionDetails);
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }
}

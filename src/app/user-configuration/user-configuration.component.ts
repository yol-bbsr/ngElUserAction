import { Component, OnInit } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';

import { MatTableDataSource } from '@angular/material';
import { SelectionModel, DataSource } from '@angular/cdk/collections';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

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

  totalvUsers: number;
  exeDuration: string = '01:30:30';
  iteration: number = 200;

  displayedColumns = ['select', 'THREADS', 'DELAY', 'START', 'HOLD', 'SHUTDOWN'];
  threadGroups: ThreadGroup[];
  dataSource: MatTableDataSource<ThreadGroup>;
  selection: SelectionModel<ThreadGroup>;

  // dataSource = new ExampleDataSource();

  // isExpansionDetailRow = (_, row: DetailRow | UserData) => row.hasOwnProperty('detailRow');
  // isExpansionDetailRow = (_, row: DetailRow|UserData) => row.hasOwnProperty('transaction');

  constructor() { }

  ngOnInit() {
    this.threadGroups = [];
    this.threadGroups.push({ threads: 10, delay: 0, startup: 10, hold: 60, shutdown: 10, transaction: this.defaultTransaction() });
    this.rePaint();
  }

  defaultTransaction() {
    const transaction: Step[] = [];
    // launch step
    transaction.push({ transID: 1, name: 'Launch', duration: 1, prevStepID: 0, nextStepID: 2 });
    // login step
    transaction.push({ transID: 2, name: 'Login', duration: 3, prevStepID: 1, nextStepID: 3 });
    // transaction one step
    transaction.push({ transID: 3, name: 'Transaction One', duration: 15, prevStepID: 2, nextStepID: 4 });
    // logout step
    transaction.push({ transID: 4, name: 'Logout', duration: 5, prevStepID: 3, nextStepID: 0 });
    return transaction;
  }

  rePaint() {
    this.dataSource = new MatTableDataSource<ThreadGroup>(this.threadGroups);
    this.selection = new SelectionModel<ThreadGroup>(true, []);
    // calculate the total values for display
    this.totalvUsers = 0;
    this.threadGroups.forEach(element => {
      this.totalvUsers += element.threads;
    });
  }

  onAddScenatio() {
    this.threadGroups.push({ threads: 10, delay: 10, startup: 10, hold: 60, shutdown: 10, transaction: this.defaultTransaction() });
    this.rePaint();
  }

  onDeleteScenario() {
    this.selection.selected.forEach(element => {
      this.threadGroups = this.threadGroups.filter(item => item !== element);
    });
    this.rePaint();
  }

  onSimulate() {
    this.panelOpenState = false;
    this.rePaint();
  }

  toggleDetails(row) { if (row === this.expandedElement) { this.expandedElement = null; } else { this.expandedElement = row; } }

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

export interface ThreadGroup {
  threads: number;
  delay: number;
  startup: number;
  hold: number;
  shutdown: number;
  transaction: Step[];
}

export interface Transaction {
  detailRow: boolean;
  steps: Step[];
}

export interface Step {
  transID: number;
  name: string;
  duration: number;
  prevStepID: number;
  nextStepID: number;
}

/**
 * Data source to provide what data should be rendered in the table. The observable provided
 * in connect should emit exactly the data that should be rendered by the table. If the data is
 * altered, the observable should emit that new set of data on the stream. In our case here,
 * we return a stream that contains only one set of data that doesn't change.
* /
// export class ExampleDataSource extends DataSource<any> {
//   /** Connect function called by the table to retrieve one stream containing the data to render. */
// connect(): Observable < Element[] > {
//   const rows = [];
//   data.forEach(element => rows.push(element, { detailRow: true, element }));
//   return Observable.of(rows);
// };

// disconnect(); { }
// }


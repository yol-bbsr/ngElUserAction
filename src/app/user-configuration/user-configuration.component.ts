import { Component, OnInit } from '@angular/core';

import { MatTableDataSource } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'app-user-configuration',
  templateUrl: './user-configuration.component.html',
  styleUrls: ['./user-configuration.component.scss']
})
export class UserConfigurationComponent implements OnInit {
  panelOpenState = false;

  totalvUsers: number;
  exeDuration: string = '01:30:30';
  iteration: number = 200;

  displayedColumns = ['select', 'THREADS', 'DELAY', 'START', 'HOLD', 'SHUTDOWN'];
  ELEMENT_DATA: Element[];
  dataSource: MatTableDataSource<Element>;
  selection: SelectionModel<Element>;

  constructor() { }

  ngOnInit() {
    this.ELEMENT_DATA = [];
    this.ELEMENT_DATA.push({ threads: 10, delay: 0, startup: 10, hold: 60, shutdown: 10 });
    this.rePaint();
  }

  rePaint() {
    this.dataSource = new MatTableDataSource<Element>(this.ELEMENT_DATA);
    this.selection = new SelectionModel<Element>(true, []);
    // calculate the total values for display
    this.totalvUsers = 0;
    this.ELEMENT_DATA.forEach(element => {
      this.totalvUsers += element.threads;
    });
  }

  onAddScenatio() {
    this.ELEMENT_DATA.push({ threads: 10, delay: 10, startup: 10, hold: 60, shutdown: 10 });
    this.rePaint();
  }

  onDeleteScenario() {
    this.selection.selected.forEach(element => {
      this.ELEMENT_DATA = this.ELEMENT_DATA.filter(item => item !== element);
    });
    this.rePaint();
  }

  onSimulate() {
    this.panelOpenState = false;
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

export interface Element {
  threads: number;
  delay: number;
  startup: number;
  hold: number;
  shutdown: number;
}

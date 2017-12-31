import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSlideToggleModule } from '@angular/material';
import { GraphSettings } from '../user-configuration/user-configuration.model';

@Component({
  selector: 'app-graph-settings',
  templateUrl: './graph-settings.component.html',
  styleUrls: ['./graph-settings.component.scss']
})
export class GraphSettingsComponent implements OnInit, OnDestroy {

  originalSettings: GraphSettings | null;
  constructor(public thisDialogRef: MatDialogRef<GraphSettingsComponent>, @Inject(MAT_DIALOG_DATA) public settings: GraphSettings) { }

  ngOnInit() {
    this.originalSettings = { isOpenConfigPanel: this.settings.isOpenConfigPanel, isSimulateSteps: this.settings.isSimulateSteps };
  }

  ngOnDestroy() {
    this.originalSettings = null;
  }

  onCloseConfirm() {
    this.thisDialogRef.close(this.settings);
  }

  onCloseCancel() {
    this.thisDialogRef.close(this.originalSettings);
  }
}

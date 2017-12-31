import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';

import { D3Service } from 'd3-ng2-service';
import { DragulaModule } from 'ng2-dragula/ng2-dragula';
import { NgxElectronModule } from 'ngx-electron';

import { SharedModule } from './shared/shared.module';
import { UserConfigurationComponent } from './activity-graph/user-configuration/user-configuration.component';
import { ActivityGraphComponent } from './activity-graph/activity-graph.component';
import { DragZoom2Component } from './d3-demo/drag-zoom-2.component';
import { CdkDetailRowDirective } from './shared/cdk-detail-row.directive';
import { GraphSettingsComponent } from './activity-graph/graph-settings/graph-settings.component';

@NgModule({
  declarations: [
    AppComponent,
    UserConfigurationComponent,
    ActivityGraphComponent,
    DragZoom2Component,
    CdkDetailRowDirective,
    GraphSettingsComponent
  ],
  imports: [
    BrowserModule,
    SharedModule,
    DragulaModule,
    NgxElectronModule
  ],
  entryComponents: [GraphSettingsComponent],
  providers: [ D3Service ],
  bootstrap: [AppComponent]
})
export class AppModule { }

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';

import { D3Service } from 'd3-ng2-service';
import { NgxElectronModule } from 'ngx-electron';
import { SharedModule } from './shared/shared.module';
import { UserConfigurationComponent } from './user-configuration/user-configuration.component';
import { ActivityGraphComponent } from './activity-graph/activity-graph.component';
import { DragZoom2Component } from './d3-demo/drag-zoom-2.component';

@NgModule({
  declarations: [
    AppComponent,
    UserConfigurationComponent,
    ActivityGraphComponent,
    DragZoom2Component
  ],
  imports: [
    BrowserModule,
    SharedModule,
    NgxElectronModule
  ],
  providers: [ D3Service ],
  bootstrap: [AppComponent]
})
export class AppModule { }

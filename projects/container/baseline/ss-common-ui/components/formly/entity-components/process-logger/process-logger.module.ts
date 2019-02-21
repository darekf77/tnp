// angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
// material
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
// other
import { MomentModule } from 'ngx-moment';
// local
import { ProcessLoggerComponent } from './process-logger.component';
import { ButtonIconModule } from '../../base-components';
import { ProcessConsoleInfoModule } from './process-console-info/process-console-info.module';
import { StandalonePopupModule } from '../../../ui-elements/standalone-popup';
import { ProcessInfoMessageComponent } from './process-info-message/process-info-message.component';
import { ResizeService } from '../../../helpers/resize-service';



const angularModules = [
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
];

const materialModules = [
  MatExpansionModule,
  MatTabsModule,
  MatIconModule,
  MatListModule
];

const otherModules = [
  MomentModule
]

const localModules = [
  StandalonePopupModule,
  ProcessConsoleInfoModule,
  ButtonIconModule
];

const localComponents = [
  ProcessInfoMessageComponent,
  ProcessLoggerComponent
]

@NgModule({
  imports: [
    ...angularModules,
    ...materialModules,
    ...otherModules,
    ...localModules,
  ],
  entryComponents: [ProcessLoggerComponent],
  exports: [ProcessLoggerComponent, MomentModule],
  declarations: [
    ...localComponents
  ],
  providers: [ResizeService]
})
export class ProcessLoggerModule { }

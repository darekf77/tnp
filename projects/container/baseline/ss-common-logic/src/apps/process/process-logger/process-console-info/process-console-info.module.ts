import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProcessConsoleInfoComponent } from './process-console-info.component';
import { ResizeService } from 'ss-common-ui/components/helpers';

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    ProcessConsoleInfoComponent
  ],
  declarations: [ProcessConsoleInfoComponent],
  providers: [ResizeService],
})
export class ProcessConsoleInfoModule { }

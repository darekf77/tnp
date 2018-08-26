import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// material
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
// local
import { MultimediaChooserModule } from './multimedia-chooser/multimedia-chooser.module';
import { MultimediaUploadModule } from './multimedia-upload/multimedia-upload.module';
import { MultimediaWrapperComponent } from './multimedia-wrapper.component';
import { DialogWrapperModule } from '../dialog-wrapper';

const angularModules = [
  CommonModule
];

const moduleMaterial = [
  MatTabsModule,
  MatDialogModule
];

const localModules = [
  MultimediaChooserModule,
  MultimediaUploadModule,
  DialogWrapperModule
];


@NgModule({
  imports: [
    ...angularModules,
    ...moduleMaterial,
    ...localModules
  ],
  declarations: [MultimediaWrapperComponent]
})
export class MultimediaWrapperModule { }

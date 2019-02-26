import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonIconComponent } from './button-icon.component';

// material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


const materialModules = [
  MatButtonModule,
  MatIconModule,
  MatProgressSpinnerModule
];

@NgModule({
  imports: [
    CommonModule,
    ...materialModules
  ],
  declarations: [ButtonIconComponent],
  exports: [ButtonIconComponent]
})
export class ButtonIconModule { }

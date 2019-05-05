import * as _ from 'lodash';
import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '../../../helpers';
import { CLASS } from 'typescript-class-helpers/browser';

@CLASS.NAME('FormlyButtionWithActionComponent')
@Component({
  selector: 'app-formly-buttion-with-action',
  templateUrl: './formly-buttion-with-action.component.html',
  styleUrls: ['./formly-buttion-with-action.component.scss']
})
export class FormlyButtionWithActionComponent  extends BaseComponent {


  action() {
    if (_.isFunction(this.field.templateOptions.action)) {
      this.field.templateOptions.action();
    }
  }

  ngOnInit() {
    if (!this.field.templateOptions.icon) {
      this.field.templateOptions.icon = 'home';
    }
    if (!this.field.templateOptions.lable) {
      this.field.templateOptions.lable = 'Button';
    }
  }


}

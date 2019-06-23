import * as _ from 'lodash';
import {
  EventEmitter, Component, OnInit, Input,
  Output, OnChanges, ElementRef, AfterViewInit, HostBinding, OnDestroy
} from '@angular/core';
import { PROCESS } from '../../PROCESS';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { BaseComponent } from 'ss-common-ui/components/helpers';
import { ResizeService } from 'ss-common-ui/components/helpers';

@Component({
  selector: 'app-process-console-info',
  templateUrl: './process-console-info.component.html',
  styleUrls: ['./process-console-info.component.scss']
})
export class ProcessConsoleInfoComponent extends BaseComponent
  implements OnInit, AfterViewInit, OnDestroy {


  @Input() public changes: BehaviorSubject<void>;
  @Input() public outputType: 'stdout' | 'stder' = 'stdout';
  @Input() public model: PROCESS;

  get process() {
    return this.model;
  }
  @HostBinding('style.height.px') height = 190;


  public resizeService: ResizeService = new ResizeService();
  constructor(private elemetRef: ElementRef) {
    super();
  }


  scrollDown() {
    setTimeout(() => {
      if (this.elemetRef && this.elemetRef.nativeElement) {
        this.elemetRef.nativeElement.scrollTop = this.elemetRef.nativeElement.scrollHeight;
      }
    }, 100);
  }

  clear(consoleContent: string) {
    return consoleContent.replace(/(?:\r\n|\r|\n)/g, '<br>');
  }

  ngOnInit() {

    this.resizeService.addResizeEventListener(this.elemetRef.nativeElement, (elem) => {
      const height = Number((this.elemetRef.nativeElement as HTMLElement).style.height.replace('px', ''));
      // console.log('set new height',height)
      localStorage.setItem(this.lsKey, height.toString());
    });

    this.handlers.push(this.changes.subscribe(() => {
      // console.log('CHANGES PROCESS INFO')
      this.scrollDown();
    }) as any);


    // console.log(`SUBSCRIBE PROPTERY: ${this.process.id} - ${this.outputType} `);

    this.process.subscribeRealtimeUpdates({
      property: this.outputType,
      bufforProperty: `_${this.outputType}` as any,
      callback: () => {
        this.changes.next(void 0);
      }
    });




  }

  get lsKey() {
    return `process-console-info-model-${this.outputType}-height-${this.model.id}`;
  }

  ngAfterViewInit() {

    // const savedHeight = Number(localStorage.getItem(this.lsKey));
    // console.log('from local storage height', savedHeight)
    // setTimeout(() => {
    //   if (!isNaN(savedHeight) && savedHeight > 0) {
    //     this.height = savedHeight;
    //   }
    //   this.scrollDown();
    // });
  }
  ngOnDestroy(): void {
    this.handlers.forEach(h => h.unsubscribe());
    this.resizeService.removeResizeEventListener(this.elemetRef.nativeElement);
    if (this.model instanceof PROCESS) {
      this.process.unsubscribeRealtimeUpdates(this.outputType);
    }
  }

}

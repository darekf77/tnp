import { Component, OnInit, AfterViewInit, ViewChild, TemplateRef } from '@angular/core';

// material
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Log, Level } from 'ng2-logger/browser';
const log = Log.create('multimedia-upload');

import { FileUploader, FileItem } from 'ng2-file-upload';
import { AuthController } from 'ss-common-logic/browser/controllers/core/AuthController';
import { SESSION } from 'ss-common-logic/browser/entities/core/SESSION';
const URL = `${ENV.workspace.projects.find(({ name }) => name === 'ss-common-logic').host}/MultimediaController/upload`;

import { TableColumn } from '@swimlane/ngx-datatable';
interface TableRow {
  name: string;
  size: string;
  progress: string;
  actions?: string;
  item: FileItem;
}

@Component({
  selector: 'app-multimedia-upload',
  templateUrl: './multimedia-upload.component.html',
  styleUrls: ['./multimedia-upload.component.scss']
})
export class MultimediaUploadComponent implements OnInit, AfterViewInit {

  constructor(
    private auth: AuthController
  ) {

  }

  get rows(): { name: string; progress: number; }[] {
    return (this.uploader && Array.isArray(this.uploader.queue)) ?
      this.uploader.queue.map(i => {
        return {
          name: i.file.name,
          size: `${((i.file && i.file.size) / 1024 / 1024).toFixed(2)} mb`,
          progress: i.progress,
          item: i
        };
      }) : [];
  }

  @ViewChild('dialog') private dialog: TemplateRef<any>;
  @ViewChild('cellTemplateActions') cellTemplateActions: TemplateRef<any>;
  @ViewChild('cellTemplateSize') cellTemplateSize: TemplateRef<any>;
  columns: TableColumn[] = [];


  public uploader: FileUploader;

  public hasBaseDropZoneOver = false;



  async ngOnInit() {
    console.log('ENV', ENV);
    await this.auth.browser.init(false);
    const session = SESSION.localStorage.fromLocalStorage();
    const headers = session ? [session.activationTokenHeader] : undefined;
    this.uploader = new FileUploader({ url: URL, headers });
    this.uploader.onBeforeUploadItem = (item) => { item.withCredentials = false; console.log(item); };
  }

  ngAfterViewInit() {
    log.i('this.cellTemplate', this.cellTemplateActions);
    this.columns = [
      {
        prop: 'name'
      },
      {
        prop: 'size'
      },
      {
        prop: 'progress'
      },
      {
        prop: 'item',
        cellTemplate: this.cellTemplateActions
      }
    ];
  }
  public fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }


}

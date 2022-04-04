import { Component, NgZone, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
const electron = (<any>window).require('electron');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

  ipc = electron.ipcRenderer;
  pageindex: number = 0;
  title = 'emok-task-manager';
  info: any = {};
  processes: any[] = [];

  constructor(private ngZone: NgZone, private messageService: MessageService) {
    
    this.ipc.on('info', (ev: any, resp: any) => {
      this.ngZone.run(() => { this.info = resp })
    })
    this.ipc.on('getProcess', (ev: any, resp: any) => {
      this.ngZone.run(() => { this.processes = resp })
    })
    this.ipc.on('kill', (ev: any, resp: any) => {
      if(resp.ok){
        this.messageService.add({
          severity:'success',
          summary:'عملیات موفق',
          detail:'پردازش مورد نظر متوقف گردید.'
        })
      }else{
        let msg:string = '';
        (resp.errors).forEach((err:string) => {
          msg+=err
        });
        this.messageService.add({
          severity:'success',
          summary:'خطای سیستمی',
          detail:msg
        })
      }
      
    })
  }

  ngOnInit(): void {
    this.ipc.send('info');
    this.ipc.send('getProcess');
    setInterval(() => {
      this.ipc.send('getProcess')
    }, 3000);
  }

  killProcess(id: string | number) {
    this.ipc.send('kill', Number(id))
  }

}

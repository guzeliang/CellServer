import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import { FormsModule }   from '@angular/forms';
import { HttpModule }   from '@angular/http';

import { AppRoutingModule } from './app-routing.module';

import {AppComonent} from './app.component';
import {HeaderComponent} from './common/app.header.component';
import {FooterComponent} from './common/app.footer.component';
import { NotFoundComponent } from './common/notfound.component';
import {Ng2PaginationModule} from 'ng2-pagination';

import {DevicesComponent} from './device/devices.component';
import {EditComponent} from './device/device-edit.component';
import {DeviceDetailComponent} from './device/device-detail.component';
import {HelloComponent} from './common/hello.component';
import {StatComponent} from './stat/stat.component';

import {DeviceService} from './device/device.service';
import {StatService} from './stat/stat.service';

@NgModule({
    imports:[
        BrowserModule, 
        FormsModule,
        HttpModule,
        Ng2PaginationModule,
        AppRoutingModule
    ],
    declarations: [ HeaderComponent, FooterComponent, AppComonent, DevicesComponent, HelloComponent,NotFoundComponent, StatComponent, EditComponent,DeviceDetailComponent],
    providers: [DeviceService, StatService],
    bootstrap:    [ AppComonent  ]
})

export class AppModule {}
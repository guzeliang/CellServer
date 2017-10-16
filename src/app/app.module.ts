import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule }   from '@angular/forms';
import { HttpModule }   from '@angular/http';

import { AppRoutingModule } from './app-routing.module';

import { PaginatePipe } from 'ng2-pagination/dist/paginate.pipe';
import { PaginationControlsComponent } from 'ng2-pagination/dist/pagination-controls.component';
import { PaginationControlsDirective } from 'ng2-pagination/dist/pagination-controls.directive';
import { PaginationService } from 'ng2-pagination/dist/pagination.service';

import { AppComponent } from './app.component';
import { HeaderComponent } from './common/app.header.component';
import { FooterComponent } from './common/app.footer.component';
import { PagingComponent } from './common/paging.component';
import { NotFoundComponent } from './common/notfound.component';

import { DevicesComponent } from './device/devices.component';
import { EditComponent } from './device/device-edit.component';
import { DeviceDetailComponent } from './device/device-detail.component';
import { HelloComponent } from './common/hello.component';
import { StatComponent } from './stat/stat.component';
 
import { DeviceService } from './device/device.service';
import { StatService } from './stat/stat.service';

@NgModule({
    imports: [
        BrowserModule, 
        FormsModule,
        HttpModule,
        AppRoutingModule
    ],
    declarations: [ 
        HeaderComponent, 
        FooterComponent, 
        PagingComponent,
        AppComponent, 
        DevicesComponent, 
        HelloComponent,
        NotFoundComponent, 
        StatComponent, 
        EditComponent,
        DeviceDetailComponent,
        PaginatePipe,
        PaginationControlsComponent,
        PaginationControlsDirective
    ],
    providers: [DeviceService, StatService, PaginationService],
    bootstrap:    [ AppComponent  ]
})

export class AppModule {}

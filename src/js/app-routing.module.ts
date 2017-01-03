import { Routes, RouterModule } from '@angular/router';
import { NgModule }             from '@angular/core';

import {DevicesComponent} from './device/devices.component';
import {StatComponent} from './stat/stat.component';
import {EditComponent} from './device/device-edit.component';
import {DeviceDetailComponent} from './device/device-detail.component';
import {HelloComponent} from './common/hello.component';
import { NotFoundComponent } from './common/notfound.component';

export const appRoutes: Routes = [
  { path: 'devices',  component: DevicesComponent },
  { path: 'hello', component: HelloComponent },
  { path: 'iot/stat/v', component: StatComponent },
  { path: 'iot/edit/v', component: EditComponent },
  { path: 'iot/detail/v', component: DeviceDetailComponent },
  { path: '', redirectTo: '/devices', pathMatch: 'full' },
  { path: '**',    component: NotFoundComponent }
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule {}

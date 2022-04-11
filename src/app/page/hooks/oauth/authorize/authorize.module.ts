import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { AuthorizePage } from './authorize.page';
import { LoaderModule } from '../../../../components/loader/loader.module';

const routes: Routes = [
    {
      path: '',
      component: AuthorizePage
    }
]
@NgModule({
  imports: [
    LoaderModule,
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
  ],
  declarations: [AuthorizePage]
})
export class AuthorizePageModule {}

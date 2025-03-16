import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PlayersListPage } from './players-list/players-list.page';

const routes: Routes = [
  {
    path: '',
    component: PlayersListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PlayerPageRoutingModule {}

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GamePage } from './game.page';
import { GameSessionComponent } from './game-session.component';

const routes: Routes = [
  {
    path: '',
    component: GameSessionComponent, // GamePage
  },
  {
    path: 'a',
    component: GamePage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GamePageRoutingModule {}

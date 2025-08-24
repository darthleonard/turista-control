import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ComponentsModule } from '../components/components.module';
import { GamePageRoutingModule } from './game-routing.module';
import { GamePage } from './game.page';
import { PlayersComponent } from './players/players.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    GamePageRoutingModule,
  ],
  declarations: [GamePage, PlayersComponent],
})
export class GamePageModule {}

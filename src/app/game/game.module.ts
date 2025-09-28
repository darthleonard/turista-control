import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ComponentsModule } from '../components/components.module';
import { GamePageRoutingModule } from './game-routing.module';
import { GamePage } from './game.page';
import { PlayersComponent } from './players/players.component';
import { GameSessionComponent } from './game-session.component';
import { GameConfigComponent } from './game-config/game-config.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ComponentsModule,
    GamePageRoutingModule,
    TranslateModule,
  ],
  declarations: [
    GamePage,
    GameSessionComponent,
    GameConfigComponent,
    PlayersComponent,
  ],
})
export class GamePageModule {}

import { Component, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';
import { PlayerPageRoutingModule } from './players-routing.module';
import { PlayersListPage } from './players-list/players-list.page';
import { ComponentsModule } from '../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    PlayerPageRoutingModule,
    TranslateModule,
  ],
  declarations: [PlayersListPage],
})
export class PlayersPageModule {}

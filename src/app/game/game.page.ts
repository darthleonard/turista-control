import { Component, OnInit, ViewChild } from '@angular/core';
import { Player } from '../database/local-database';
import { PlayersComponent } from './players/players.component';

@Component({
  selector: 'app-game',
  templateUrl: './game.page.html',
  standalone: false,
})
export class GamePage {
  @ViewChild(PlayersComponent) private readonly playersModal!: PlayersComponent;

  constructor() {}

  players!: Player;

  ionViewWillEnter() {
    // if(!this.players) {
    //   this.playersModal.setOpen(true);
    // }
  }

  addPlayers(players: any) {
    //this.players = players;
    console.log(players);
  }
}

import { Component, OnInit, ViewChild } from '@angular/core';
import { Player } from '../database/local-database';
import { PlayersComponent } from './players/players.component';
import { GameService } from '../services/game.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.page.html',
  styleUrls: ['./game.page.scss'],
  standalone: false,
})
export class GamePage {
  @ViewChild(PlayersComponent) private readonly playersModal!: PlayersComponent;

  constructor(private readonly gameService: GameService) {}

  players!: Player[];
  currentPlayer!: Player;
  loaded = false;

  // model of the current state (turn, player, actions applied, etc.)
  // currentState = {
  //   turn: 1,
  //   player: this.currentPlayer,
  //   actions: []
  // };

  ionViewWillEnter() {
    // if(!this.players) {
    //   this.playersModal.setOpen(true);
    // }

    this.loadGame().then(() => {
      this.currentPlayer = this.players[0];
      this.loaded = true;
    });
  }

  addPlayers(players: any) {
    //this.players = players;
    console.log(players);
  }

  onUpdatePositionClick() {
    // request for dice roll (2d6)
    // current player position should be loaded at onNextTurnClick, to do calculations
    // select which cell is the player moving to, update position
    // if cell is start position or if player passes start position, give money to player
    // update cell info on UI
    // if property is card(email/message), draw card and apply effect
    // if the property is owned by another player, pay rent (if the property is owned by the current player, do nothing)
    // if the property is unowned, offer to buy or auction
  }

  onNextTurnClick() {
    // TODO: handle flag to indicate reverse turn order is finished
    // TODO: handle flow if coming back from previous turn navigation (should not advance turn)
    // TODO: save current player state
    // TODO: add current state to history

    const currentIndex = this.players.indexOf(this.currentPlayer);
    const nextIndex = (currentIndex + 1) % this.players.length;
    this.currentPlayer = this.players[nextIndex];
  }

  onPreviousTurnClick() {
    // TODO: handle flag to indicate reverse turn order (may be counter of steps)
    const currentIndex = this.players.indexOf(this.currentPlayer);
    const previousIndex =
      (currentIndex - 1 + this.players.length) % this.players.length;
    this.currentPlayer = this.players[previousIndex];
  }

  onFinishGameClick() {
    // TODO: confirm action
    // TODO: save current player state
    // TODO: show final summary and stats
  }

  private async loadGame() {
    await this.loadPlayers();
    // load board, properties, cards, etc.
  }

  private async loadPlayers() {
    const playerIds = [1, 2, 3];
    this.players = await this.gameService.getPlayersByIds(playerIds);
  }
}

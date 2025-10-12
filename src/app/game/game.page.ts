import { Component, OnInit, ViewChild } from '@angular/core';
import { PlayersComponent } from './players/players.component';
import { GameService } from '../services/game.service';
import { PlayerActionsComponent } from './player-actions/player-actions.component';
import { GameSession, Player, TurnDetail } from '../models';

@Component({
  selector: 'app-game',
  templateUrl: './game.page.html',
  styleUrls: ['./game.page.scss'],
  standalone: false,
})
export class GamePage {
  @ViewChild(PlayersComponent) private readonly playersModal!: PlayersComponent;
  @ViewChild(PlayerActionsComponent)
  private readonly playerActionsModal!: PlayerActionsComponent;

  private currentGameSessionId!: number;
  private currentTurn = 0;
  private isReversingTurnOrder = false;
  private reverseTurnSteps = 0;

  private gameSession!: GameSession;

  private turnDetail!: TurnDetail;

  constructor(private readonly gameService: GameService) {}

  players!: Player[];
  currentPlayer!: Player;
  loaded = false;

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
    this.playerActionsModal.setOpen(true);

    // request for dice roll (2d6)
    // current player position should be loaded at onNextTurnClick, to do calculations
    // select which cell is the player moving to, update position
    // if cell is start position or if player passes start position, give money to player
    // update cell info on UI
    // if property is card(email/message), draw card and apply effect
    // if the property is owned by another player, pay rent (if the property is owned by the current player, do nothing)
    // if the property is unowned, offer to buy or auction
  }

  async onNextTurnClick() {
    // TODO: handle flag to indicate reverse turn order is finished
    // TODO: handle flow if coming back from previous turn navigation (should not advance turn)
    // TODO: save current player state
    // TODO: add current state to history

    // save current turn detail to DB before change to new turn
    await this.gameService.saveTurnDetail(this.turnDetail);

    const currentIndex = this.players.indexOf(this.currentPlayer);
    const nextIndex = (currentIndex + 1) % this.players.length;
    this.currentPlayer = this.players[nextIndex];

    this.currentTurn++;
    this.turnDetail = {
      gameSessionId: this.gameSession.id,
      turnNumber: this.currentTurn,
      playerId: this.currentPlayer.id!,
    } as TurnDetail;

    // save new turn
    await this.gameService.saveTurnDetail(this.turnDetail);
  }

  onPreviousTurnClick() {
    // TODO: handle flag to indicate reverse turn order (may be counter of steps)
    const currentIndex = this.players.indexOf(this.currentPlayer);
    const previousIndex =
      (currentIndex - 1 + this.players.length) % this.players.length;
    this.currentPlayer = this.players[previousIndex];
  }

  async onFinishGameClick() {
    // TODO: confirm action
    // TODO: save current player state

    this.gameSession.finished = true;
    await this.gameService.saveGameSession(this.gameSession);

    // TODO: show final summary and stats
  }

  private async loadGame() {
    // check if there's an active game session in DB
    const lastSession = await this.gameService.getLastGameSession();
    if (lastSession && !lastSession.finished) {
      this.gameSession = lastSession;
      const lastTurnDetail =
        await this.gameService.getLastTurnDetailBySessionId(
          this.gameSession.id
        );
      if (lastTurnDetail) {
        this.turnDetail = lastTurnDetail;
      } else {
        this.turnDetail = {
          gameSessionId: this.gameSession.id,
          turnNumber: 1,
          playerId: this.gameSession.playerIds[0],
        } as TurnDetail;
      }
      console.log('Loaded existing game session', this.gameSession);
    } else {
      this.gameSession = {
        playerIds: [1, 2, 3],
        lastTurnDetailId: 1,
        finished: false,
      } as GameSession;
      this.gameSession.id = await this.gameService.saveGameSession(
        this.gameSession
      );

      this.turnDetail = {
        gameSessionId: this.gameSession.id,
        turnNumber: 1,
        playerId: 1,
      } as TurnDetail;
      console.log('Started new game session', this.gameSession);
    }

    this.currentTurn = this.turnDetail.turnNumber;

    this.players = await this.gameService.getPlayersByIds(
      this.gameSession.playerIds
    );

    // load board, properties, cards, etc.
  }
}

import { Component, OnInit, ViewChild } from '@angular/core';
import { PlayersComponent } from './players/players.component';
import { GameService } from '../services/game.service';
import { GameSession, Player, TurnDetail } from '../models';
import { BoardCell } from '../models/board-cells';
import { PositionSelectorComponent } from './position-selector/position-selector.component';
import { MoneyMovementComponent } from './money-movement/money-movement.component';

@Component({
  selector: 'app-game',
  templateUrl: './game.page.html',
  styleUrls: ['./game.page.scss'],
  standalone: false,
})
export class GamePage {
  @ViewChild(PlayersComponent) private readonly playersModal!: PlayersComponent;
  @ViewChild(PositionSelectorComponent)
  private readonly positionSelector!: PositionSelectorComponent;
  @ViewChild(MoneyMovementComponent)
  private readonly moneyMovementComponent!: MoneyMovementComponent;

  private currentGameSessionId!: number;
  private turnCounter = 1;
  private isReversingTurnOrder = false;
  private reverseTurnSteps = 0;

  private gameSession!: GameSession;

  constructor(private readonly gameService: GameService) {}

  players!: Player[];
  currentPlayer!: Player;
  turnDetail!: TurnDetail;
  loaded = false;
  boardCells: BoardCell[] = [];

  ionViewWillEnter() {
    // if(!this.players) {
    //   this.playersModal.setOpen(true);
    // }

    this.loadGame().then(() => {
      this.currentPlayer = this.players.find(
        (p) => p.id === this.turnDetail.playerId
      ) as Player;
      this.loaded = true;
    });
  }

  addPlayers(players: any) {
    //this.players = players;
    console.log(players);
  }

  async onUpdatePositionClick() {
    await this.positionSelector.setOpen(true);
  }

  onBuyPropertyClick() {
    // open a modal
    // select player who is buying or property was auctioned
    // show property details and confirm purchase
  }

  onAchieveMoneyClick() {
    this.moneyMovementComponent.setOpen(true, 'MONEY_FOR_PLAYER', '+');
  }

  onPayMoneyClick() {
    this.moneyMovementComponent.setOpen(true, 'MONEY_FROM_PLAYER', '-');
  }

  onPositionSelected($event: number) {
    this.turnDetail.playerPosition = $event;
  }

  onMoneyMovementDone($event: number) {
    this.turnDetail.playerTotalMoney += $event;
  }

  async onNextTurnClick() {
    // TODO: handle flag to indicate reverse turn order is finished
    // TODO: handle flow if coming back from previous turn navigation (should not advance turn)

    // save current state, turn detail should be updated after closing actions modal
    await this.gameService.saveTurnDetail(this.turnDetail);

    // create and save new state
    const currentIndex = this.players.indexOf(this.currentPlayer);
    const nextIndex = (currentIndex + 1) % this.players.length;
    this.currentPlayer = this.players[nextIndex];

    this.turnCounter++;
    const isGameBeginning = this.turnCounter <= this.players.length;
    const previousPlayerTurnDetail = await this.getOrCreateTurnDetail(
      isGameBeginning,
      this.currentPlayer.id
    );

    this.turnDetail = this.getDefaultTurn(this.currentPlayer.id);
    this.turnDetail.playerTotalMoney =
      previousPlayerTurnDetail.playerTotalMoney;
    this.turnDetail.playerPosition = previousPlayerTurnDetail.playerPosition;

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
    // load game config
    const boardId = 1; // TODO: get from game config
    this.boardCells = await this.gameService.getBoardCells(boardId);

    // check if there's an active game session in DB
    const lastSession = await this.gameService.getLastGameSession();
    if (lastSession && !lastSession.finished) {
      this.gameSession = lastSession;
      this.turnDetail = await this.getOrCreateTurnDetail(false);
    } else {
      // create and save new game session and turn detail
      this.gameSession = {
        playerIds: [1, 2, 3],
        lastTurnDetailId: 1,
        finished: false,
      } as GameSession;
      this.gameSession.id = await this.gameService.saveGameSession(
        this.gameSession
      );

      this.turnDetail = await this.getOrCreateTurnDetail(true);
    }

    await this.gameService.saveTurnDetail(this.turnDetail);
    this.turnCounter = this.turnDetail.turnNumber;

    this.players = await this.gameService.getPlayersByIds(
      this.gameSession.playerIds
    );
  }

  private async getOrCreateTurnDetail(
    isGameBeginning: boolean,
    playerId?: number
  ): Promise<TurnDetail> {
    // If there is no gameSession, throw exception
    if (!this.gameSession) {
      throw { message: 'Game Session is not started' };
    }

    if (isGameBeginning) {
      return this.getDefaultTurn(playerId);
    }

    const lastTurnDetail = await this.gameService.getLastTurnDetailBySessionId(
      this.gameSession.id,
      playerId
    );

    if (lastTurnDetail) {
      return lastTurnDetail;
    }

    console.warn('turn not found for existing session, creating default turn');
    return this.getDefaultTurn(playerId);
  }

  private getDefaultTurn(playerId?: number): TurnDetail {
    return {
      gameSessionId: this.gameSession.id,
      turnNumber: this.turnCounter,
      playerId: playerId || this.gameSession.playerIds[0],
      playerPosition: 0,
      playerTotalMoney: 75000, // TODO: get from game config
      playerDebit: 0,
      playerCredit: 0,
    } as TurnDetail;
  }
}

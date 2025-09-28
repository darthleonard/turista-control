import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { GameEngineService } from '../services/game-engine.service';
import { GameService } from '../services/game.service';
import { Player, GameConfig, GameState } from '../database/local-database';
import { GameConfigComponent } from './game-config/game-config.component';

@Component({
  selector: 'app-game-session',
  templateUrl: './game-session.component.html',
  styleUrls: ['./game-session.component.scss'],
  standalone: false,
})
export class GameSessionComponent implements OnInit {
  players: Player[] = [];
  gameState: GameState | null = null;
  currentPlayerId: number | null = null;
  currentPlayerName: string = '';
  activeConfig?: GameConfig;
  hasActiveGame = false;

  moveSteps: number | null = null;
  moveStepsError: string | null = null;

  playerNamesMap: { [id: number]: string } = {};

  constructor(
    private readonly gameEngine: GameEngineService,
    private readonly gameService: GameService,
    private readonly modalCtrl: ModalController
  ) {}

  async ngOnInit() {
    const currentGame = this.gameEngine.getCurrentGame();
    if (currentGame) {
      await this.restorePlayers(currentGame.state);
      await this.updateState();
      this.hasActiveGame = true;
      return;
    }

    const lastConfig = await this.gameService.getLastConfig();
    if (lastConfig) {
      this.activeConfig = lastConfig;
      this.hasActiveGame = true;
    }
  }

  private async restorePlayers(state: GameState) {
    const playerIds = Object.keys(state.playersState).map((id) => Number(id));
    this.players = await this.gameService.getPlayersByIds(playerIds);
    this.mapPlayerNames();
  }

  private mapPlayerNames() {
    this.playerNamesMap = {};
    this.players.forEach((p) => (this.playerNamesMap[p.id!] = p.name));
  }

  /** Continuar partida previa */
  async continueGame() {
    if (!this.activeConfig) return;

    const current = this.gameEngine.getCurrentGame();
    if (!current) {
      // restaurar jugadores desde config
      const players = await this.gameService.getPlayersByIds(
        this.activeConfig.playerIds
      );
      this.players = players;
      this.mapPlayerNames();

      // restaurar estado guardado
      const state = await this.gameService.getStateByConfig(
        this.activeConfig.id!
      );
      if (state) {
        this.gameState = state;
        this.currentPlayerId = state.currentPlayerId;
        this.currentPlayerName =
          this.playerNamesMap[state.currentPlayerId!] ?? '';
      }
    } else {
      await this.updateState();
    }
  }

  /** Abrir modal de configuración para nueva partida */
  async startNewGame() {
    const configModal = await this.modalCtrl.create({
      component: GameConfigComponent,
      componentProps: { config: this.activeConfig },
    });

    await configModal.present();
    const { data: configData } = await configModal.onWillDismiss<GameConfig>();
    if (!configData) return;

    const configId = await this.gameService.saveConfig(configData);
    this.activeConfig = { ...configData, id: configId };

    this.players = await this.gameService.getPlayersByIds(configData.playerIds);
    this.mapPlayerNames();

    await this.gameEngine.startNewGame(this.activeConfig, this.players);
    await this.updateState();
    this.hasActiveGame = true;
  }

  /** Avanzar turno */
  async nextTurn() {
    const state = await this.gameEngine.nextTurn();
    if (state) {
      this.gameState = state;
      this.currentPlayerId = state.currentPlayerId;
      this.currentPlayerName =
        this.playerNamesMap[state.currentPlayerId!] ?? '';
    }
  }

  onStepsChange() {
    if (this.moveSteps == null) return;

    if (this.moveSteps < 2 || this.moveSteps > 12) {
      this.moveStepsError = 'MOVE_STEPS_ERROR';
      this.moveSteps = Math.max(2, Math.min(this.moveSteps, 12));
    } else {
      this.moveStepsError = null;
    }
  }

  async movePlayer() {
    if (!this.currentPlayerId || this.moveSteps == null || this.moveStepsError)
      return;

    await this.gameEngine.movePlayer(this.currentPlayerId, this.moveSteps);
    this.moveSteps = null;
    await this.updateState();
  }

  async buyProperty(propertyId: number) {
    if (!this.currentPlayerId) return;
    await this.gameEngine.buyProperty(this.currentPlayerId, propertyId);
    await this.updateState();
  }

  async payRent(propertyId: number, ownerId: number) {
    if (!this.currentPlayerId) return;
    await this.gameEngine.payRent(this.currentPlayerId, propertyId, ownerId);
    await this.updateState();
  }

  async endGame() {
    if (!this.gameState || !this.currentPlayerId) return;
    const historyId = await this.gameEngine.endGame(
      this.gameState.gameConfigId,
      this.currentPlayerId
    );
    console.log('Juego finalizado, history id:', historyId);
    this.gameState = null;
    this.currentPlayerId = null;
    this.currentPlayerName = '';
    this.hasActiveGame = false;
  }

  getPlayerPropertiesLength(playerId: number): number {
    return this.gameState?.playersState[playerId]?.properties.length ?? 0;
  }

  getPlayerCash(playerId: number): number {
    return this.gameState?.playersState[playerId]?.cash ?? 0;
  }

  private async updateState() {
    const game = this.gameEngine.getCurrentGame();
    if (game) {
      this.gameState = game.state;
      this.currentPlayerId = game.state.currentPlayerId;
      this.currentPlayerName =
        this.playerNamesMap[game.state.currentPlayerId!] ?? '';
    }
  }
}

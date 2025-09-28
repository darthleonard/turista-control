import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { GameEngineService } from '../services/game-engine.service';
import { GameService } from '../services/game.service';
import { Player, GameConfig, GameState } from '../database/local-database';
import { GameConfigComponent } from './game-config/game-config.component';
import { PlayersComponent } from './players/players.component';

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
  activeConfig?: GameConfig;

  constructor(
    private readonly gameEngine: GameEngineService,
    private readonly gameService: GameService,
    private readonly modalCtrl: ModalController
  ) {}

  async ngOnInit() {
    // Intentar reanudar partida existente
    const currentGame = this.gameEngine.getCurrentGame();
    if (currentGame) {
      await this.updateState();
    } else {
      // Cargar última configuración guardada
      this.activeConfig = await this.gameService.getLastConfig();
    }
  }

  /** Abrir modal de configuración para iniciar nueva partida */
  async startNewGame() {
    const configModal = await this.modalCtrl.create({
      component: GameConfigComponent,
      componentProps: { config: this.activeConfig },
    });

    await configModal.present();

    const { data: configData } = await configModal.onWillDismiss<GameConfig>();
    if (!configData) return;

    // Guardar configuración
    const configId = await this.gameService.saveConfig(configData);
    this.activeConfig = { ...configData, id: configId };

    const players = await this.gameService.getPlayersByIds(
      configData.playerIds
    );
    this.players = players;

    // Arrancar el motor de juego con la config y jugadores seleccionados
    await this.gameEngine.startNewGame(this.activeConfig, this.players);

    await this.updateState();
  }

  /** Avanzar turno */
  async nextTurn() {
    const state = await this.gameEngine.nextTurn();
    if (state) this.gameState = state;
    this.currentPlayerId = this.gameState?.currentPlayerId ?? null;
  }

  /** Mover jugador actual */
  async movePlayer(steps: number) {
    if (!this.currentPlayerId) return;
    await this.gameEngine.movePlayer(this.currentPlayerId, steps);
    await this.updateState();
  }

  /** Comprar propiedad */
  async buyProperty(propertyId: number) {
    if (!this.currentPlayerId) return;
    await this.gameEngine.buyProperty(this.currentPlayerId, propertyId);
    await this.updateState();
  }

  /** Pagar renta */
  async payRent(propertyId: number, ownerId: number) {
    if (!this.currentPlayerId) return;
    await this.gameEngine.payRent(this.currentPlayerId, propertyId, ownerId);
    await this.updateState();
  }

  /** Finalizar juego */
  async endGame(winnerId: number) {
    if (!this.gameState) return;
    const historyId = await this.gameEngine.endGame(
      this.gameState.gameConfigId,
      winnerId
    );
    console.log('Juego finalizado, history id:', historyId);
    this.gameState = null;
  }

  /** Getters seguros para mostrar información en la UI */
  getPlayerPropertiesLength(playerId: number): number {
    const ps = this.gameState?.playersState[playerId];
    return ps ? ps.properties.length : 0;
  }

  getPlayerCash(playerId: number): number {
    const ps = this.gameState?.playersState[playerId];
    return ps ? ps.cash : 0;
  }

  /** Actualiza el estado de juego desde el engine */
  private async updateState() {
    const game = this.gameEngine.getCurrentGame();
    if (game) {
      this.gameState = game.state;
      this.currentPlayerId = game.state.currentPlayerId;
    }
  }
}

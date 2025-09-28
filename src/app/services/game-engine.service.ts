import { Injectable } from '@angular/core';
import { GameService } from './game.service';
import {
  Player,
  GameConfig,
  GameState,
  PlayerState,
} from '../database/local-database';

@Injectable({ providedIn: 'root' })
export class GameEngineService {
  private currentGame: { configId: number; state: GameState } | null = null;

  constructor(private readonly gameService: GameService) {}

  getCurrentGame() {
    return this.currentGame;
  }

  // Inicia un nuevo juego o retoma uno existente
  async startNewGame(
    config: Omit<GameConfig, 'id'>,
    players: Player[]
  ): Promise<number> {
    // Revisar si ya existe un juego con este nombre
    const existingGame = await this.gameService.getByName(config.name);
    let configId: number;

    if (existingGame) {
      configId = existingGame.id!;
    } else {
      configId = await this.gameService.createGame(config);
    }

    // Revisar si ya existe estado
    const existingState = await this.gameService.getStateByConfig(configId);
    if (existingState) {
      this.currentGame = { configId, state: existingState };
      return configId;
    }

    // Inicializar jugadores
    const initialPlayersState: { [playerId: number]: PlayerState } = {};
    for (const player of players) {
      initialPlayersState[player.id!] = {
        playerId: player.id!,
        cash: config.initialMoney,
        position: 0,
        properties: [],
      };
    }

    const state: GameState = {
      gameConfigId: configId,
      turnNumber: 0,
      currentPlayerId: players[0].id!,
      playersState: initialPlayersState,
      log: [
        `Game "${config.name}" started with players: ${players
          .map((p) => p.name)
          .join(', ')}`,
      ],
    };

    const stateId = await this.gameService.saveState(state);
    this.currentGame = { configId, state: { ...state, id: stateId } };

    return configId;
  }

  /** Permite restaurar una partida en memoria */
  setCurrentGame(game: { configId: number; state: GameState }) {
    this.currentGame = game;
  }

  // Avanzar al siguiente turno
  async nextTurn(): Promise<GameState | null> {
    if (!this.currentGame) return null;

    const playerIds = Object.keys(this.currentGame.state.playersState).map(
      (id) => Number(id)
    );
    const currentIndex = playerIds.indexOf(
      this.currentGame.state.currentPlayerId
    );
    const nextIndex = (currentIndex + 1) % playerIds.length;

    this.currentGame.state.currentPlayerId = playerIds[nextIndex];
    this.currentGame.state.turnNumber += 1;

    await this.gameService.updateState(this.currentGame.state.id!, {
      currentPlayerId: this.currentGame.state.currentPlayerId,
      turnNumber: this.currentGame.state.turnNumber,
    });

    this.currentGame.state.log.push(
      `Turno ${this.currentGame.state.turnNumber}: jugador ${this.currentGame.state.currentPlayerId} activo`
    );
    return this.currentGame.state;
  }

  // Mover jugador
  async movePlayer(playerId: number, steps: number) {
    if (!this.currentGame) return;

    const playerState = this.currentGame.state.playersState[playerId];
    playerState.position += steps;
    this.currentGame.state.log.push(
      `Jugador ${playerId} se movió ${steps} pasos a posición ${playerState.position}`
    );

    await this.gameService.updateState(this.currentGame.state.id!, {
      playersState: this.currentGame.state.playersState,
    });
  }

  // Comprar propiedad
  async buyProperty(playerId: number, propertyId: number) {
    if (!this.currentGame) return;

    const playerState = this.currentGame.state.playersState[playerId];
    playerState.properties.push(propertyId);
    this.currentGame.state.log.push(
      `Jugador ${playerId} compró propiedad ${propertyId}`
    );

    await this.gameService.updateState(this.currentGame.state.id!, {
      playersState: this.currentGame.state.playersState,
    });
  }

  // Pagar renta
  async payRent(playerId: number, propertyId: number, ownerId: number) {
    if (!this.currentGame) return;

    const playerState = this.currentGame.state.playersState[playerId];
    const ownerState = this.currentGame.state.playersState[ownerId];

    const rent = 100; // placeholder
    playerState.cash -= rent;
    ownerState.cash += rent;

    this.currentGame.state.log.push(
      `Jugador ${playerId} pagó ${rent} a ${ownerId} por propiedad ${propertyId}`
    );

    await this.gameService.updateState(this.currentGame.state.id!, {
      playersState: this.currentGame.state.playersState,
    });
  }

  // Finalizar juego
  async endGame(
    configId: number,
    winnerId: number
  ): Promise<number | undefined> {
    if (!this.currentGame) return undefined;

    const state = this.currentGame.state;
    const stats: {
      [playerId: number]: {
        properties: number;
        cash: number;
        totalValue: number;
      };
    } = {};

    for (const [pid, playerState] of Object.entries(state.playersState)) {
      const playerId = Number(pid);
      const propertiesValue = playerState.properties.length * 1000; // placeholder
      const totalValue = playerState.cash + propertiesValue;

      stats[playerId] = {
        properties: playerState.properties.length,
        cash: playerState.cash,
        totalValue,
      };
    }

    const historyId = await this.gameService.saveHistory({
      gameConfigId: configId,
      totalTurns: state.turnNumber,
      winnerId,
      stats,
      finishedAt: new Date(),
    });

    this.currentGame = null;
    return historyId;
  }
}

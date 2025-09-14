import { Injectable } from '@angular/core';
import { GameService } from './game.service';
import { PlayerService } from './player.service';
import { PropertyService } from './property.service';
import { GameConfig, GameState, GameHistory } from '../database/local-database';

@Injectable({ providedIn: 'root' })
export class GameEngineService {
  constructor(
    private gameService: GameService,
    private playerService: PlayerService,
    private propertyService: PropertyService
  ) {}

  //
  // Iniciar partida
  //
  async startNewGame(
    name: string,
    playerIds: number[],
    bankPlayerId: number,
    initialMoney: number,
    boardConfig: string
  ): Promise<{ configId: number; stateId: number }> {
    const configId = await this.gameService.createConfig({
      name,
      initialMoney,
      boardConfig,
      playerIds,
      bankPlayerId,
    });

    const initialState: Omit<GameState, 'id' | 'updatedAt'> = {
      gameConfigId: configId,
      turnNumber: 1,
      currentPlayerId: playerIds[0],
      playersState: playerIds.reduce((acc, pid) => {
        acc[pid] = { cash: initialMoney, properties: [], position: 0 };
        return acc;
      }, {} as GameState['playersState']),
      log: [`Partida "${name}" iniciada con ${playerIds.length} jugadores`],
      isFinished: false,
    };

    const stateId = await this.gameService.saveState(initialState);
    return { configId, stateId };
  }

  //
  // Avanzar turno
  //
  async nextTurn(configId: number): Promise<GameState | undefined> {
    const state = await this.gameService.getStateByConfig(configId);
    const config = await this.gameService.getConfigById(configId);
    if (!state || !config) return undefined;

    const currentIndex = config.playerIds.indexOf(state.currentPlayerId);
    const nextIndex = (currentIndex + 1) % config.playerIds.length;
    const nextPlayerId = config.playerIds[nextIndex];

    const newState: Omit<GameState, 'id' | 'updatedAt'> = {
      ...state,
      turnNumber: state.turnNumber + 1,
      currentPlayerId: nextPlayerId,
      log: [
        ...state.log,
        `Turno ${state.turnNumber + 1}: jugador ${nextPlayerId}`,
      ],
      isFinished: state.isFinished,
    };

    await this.gameService.saveState(newState);
    return this.gameService.getStateByConfig(configId);
  }

  //
  // Finalizar partida
  //
  async endGame(
    configId: number,
    winnerId: number
  ): Promise<number | undefined> {
    const state = await this.gameService.getStateByConfig(configId);
    if (!state) return undefined;

    const stats: GameHistory['stats'] = {};
    for (const [pid, playerState] of Object.entries(state.playersState)) {
      const playerId = Number(pid);
      // ⚠️ por ahora cada propiedad vale 1000 (placeholder),
      // más adelante se puede calcular usando PropertyService
      const totalValue =
        playerState.cash + playerState.properties.length * 1000;
      stats[playerId] = {
        properties: playerState.properties.length,
        cash: playerState.cash,
        totalValue,
      };
    }

    return this.gameService.saveHistory({
      gameConfigId: configId,
      totalTurns: state.turnNumber,
      winnerId,
      stats,
    });
  }
}

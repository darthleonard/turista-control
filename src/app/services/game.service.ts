import { Injectable } from '@angular/core';
import {
  localDatabase,
  GameConfig,
  GameState,
  GameHistory,
} from '../database/local-database';

@Injectable({ providedIn: 'root' })
export class GameService {
  async createGame(config: Omit<GameConfig, 'id'>): Promise<number> {
    return localDatabase.gameConfigs.add({
      ...config,
      createdAt: new Date(),
    });
  }

  async saveState(state: GameState): Promise<number> {
    return localDatabase.gameStates.add({
      ...state,
      updatedAt: new Date(),
    });
  }

  async getStateByConfig(configId: number): Promise<GameState | undefined> {
    return localDatabase.gameStates
      .where('gameConfigId')
      .equals(configId)
      .last();
  }

  async saveHistory(history: Omit<GameHistory, 'id'>): Promise<number> {
    return localDatabase.gameHistories.add(history);
  }

  async getAllHistories(): Promise<GameHistory[]> {
    return localDatabase.gameHistories.toArray();
  }
}

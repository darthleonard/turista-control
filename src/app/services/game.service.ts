import { Injectable } from '@angular/core';
import { localDatabase } from '../database/local-database';
import { GameConfig, GameState, GameHistory } from '../database/local-database';

@Injectable({ providedIn: 'root' })
export class GameService {
  // Config
  async createConfig(
    config: Omit<GameConfig, 'id' | 'createdAt'>
  ): Promise<number> {
    return localDatabase.gameConfigs.add({ ...config, createdAt: new Date() });
  }

  async getConfigById(id: number): Promise<GameConfig | undefined> {
    return localDatabase.gameConfigs.get(id);
  }

  async getAllConfigs(): Promise<GameConfig[]> {
    return localDatabase.gameConfigs.toArray();
  }

  // State
  async saveState(state: Omit<GameState, 'id' | 'updatedAt'>): Promise<number> {
    return localDatabase.gameStates.put({ ...state, updatedAt: new Date() });
  }

  async getStateByConfig(configId: number): Promise<GameState | undefined> {
    return localDatabase.gameStates
      .where('gameConfigId')
      .equals(configId)
      .last();
  }

  // History
  async saveHistory(
    history: Omit<GameHistory, 'id' | 'finishedAt'>
  ): Promise<number> {
    return localDatabase.gameHistories.add({
      ...history,
      finishedAt: new Date(),
    });
  }

  async getAllHistories(): Promise<GameHistory[]> {
    return localDatabase.gameHistories.toArray();
  }
}

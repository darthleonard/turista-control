import { Injectable } from '@angular/core';
import {
  localDatabase,
  GameConfig,
  GameState,
  GameHistory,
  Player,
} from '../database/local-database';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  constructor() {}

  /** ================= CONFIGURACIONES ================= */

  async saveConfig(
    config: Omit<GameConfig, 'id'> & { id?: number }
  ): Promise<number> {
    if (config.id) {
      const { id, ...changes } = config;
      await localDatabase.gameConfigs.update(id, changes);
      return id;
    } else {
      return await localDatabase.gameConfigs.add(config);
    }
  }

  async getLastConfig(): Promise<GameConfig | undefined> {
    return await localDatabase.gameConfigs.orderBy('id').last();
  }

  async getAllConfigs(): Promise<GameConfig[]> {
    return await localDatabase.gameConfigs.toArray();
  }

  async getConfigById(id: number): Promise<GameConfig | undefined> {
    return await localDatabase.gameConfigs.get(id);
  }

  async getByName(name: string): Promise<GameConfig | undefined> {
    return await localDatabase.gameConfigs.where('name').equals(name).first();
  }

  async createGame(config: Omit<GameConfig, 'id'>): Promise<number> {
    return await localDatabase.gameConfigs.add(config);
  }

  /** ================= JUGADORES ================= */

  async getPlayersByIds(ids: number[]): Promise<Player[]> {
    return (await localDatabase.players.bulkGet(ids)) as Player[];
  }

  /** ================= ESTADO DE PARTIDA ================= */

  async saveState(state: Omit<GameState, 'id'>): Promise<number> {
    return await localDatabase.gameStates.add(state);
  }

  async updateState(id: number, changes: Partial<GameState>): Promise<number> {
    return await localDatabase.gameStates.update(id, changes);
  }

  async getStateByConfig(configId: number): Promise<GameState | undefined> {
    return await localDatabase.gameStates
      .where('gameConfigId')
      .equals(configId)
      .last();
  }

  /** ================= HISTORIAL ================= */

  async saveHistory(history: Omit<GameHistory, 'id'>): Promise<number> {
    return await localDatabase.gameHistories.add(history);
  }
}

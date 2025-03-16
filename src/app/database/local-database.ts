import Dexie from 'dexie';

export interface Player {
   id: number;
   name: string;
   image?: string;
   score?: number;
}

export class LocalDatabase extends Dexie {
  players: Dexie.Table<Player, number>;

  constructor() {
    super('turista-control');
    this.version(1).stores({
      players: 'id++',
    });
    this.players = this.table('players');
  }
}

export const localDatabase = new LocalDatabase();
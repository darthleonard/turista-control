export interface GameSession {
  id: number;
  playerIds: number[];
  lastTurnDetailId: number;
  finished: boolean;
}

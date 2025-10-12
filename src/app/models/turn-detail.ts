export interface TurnDetail {
  id: number;
  gameSessionId: number;
  playerId: number;
  turnNumber: number;
  playerPosition?: number;
}

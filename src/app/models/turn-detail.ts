export interface TurnDetail {
  id?: number;
  gameSessionId: number;
  turnNumber: number;
  playerId: number;
  playerPosition: number;
  playerTotalMoney: number;
  playerDebit: number;
  playerCredit: number;
}

import { Component, OnInit, ViewChild } from '@angular/core';
import { IonModal } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core/components';
import { localDatabase, Player } from '../../database/local-database';

@Component({
  selector: 'app-players-list',
  templateUrl: './players-list.page.html',
  styleUrls: ['./players-list.page.scss'],
  standalone: false,
})
export class PlayersListPage implements OnInit {
  @ViewChild(IonModal) private readonly modal!: IonModal;

  constructor() {}

  isModalOpen = false;
  validationResult?: { message: string } = undefined;
  players: Player[] = [];
  modalPlayer: Player = { id: 0, name: '', image: 'assets/avatar/notset.png' };

  ngOnInit() {
    this.loadPlayers();
  }

  setModalOpen(openFlag: boolean) {
    this.isModalOpen = openFlag;
  }

  modalCancel() {
    this.setModalOpen(false);
  }

  async modalConfirm() {
    this.validationResult = undefined;
    const existingPlayer = this.players.find(
      (player) =>
        player.name.toUpperCase() === this.modalPlayer?.name.toUpperCase() &&
        player.id !== this.modalPlayer?.id
    );
    if (existingPlayer) {
      this.validationResult = { message: 'PLAYER_NAME_IS_USED' };
      return;
    }

    if (!this.modalPlayer?.name) {
      this.validationResult = { message: 'PLAYER_NAME_IS_REQUIRED' };
      return;
    }

    if (this.modalPlayer?.id) {
      await localDatabase.players.update(this.modalPlayer.id, {
        name: this.modalPlayer.name.toUpperCase(),
      });
    } else {
      await localDatabase.players.add({
        name: this.modalPlayer?.name.toUpperCase(),
      } as Player);
    }

    this.setModalOpen(false);
    await this.loadPlayers();
  }

  onModalWillDismiss(event: CustomEvent<OverlayEventDetail>) {
    this.modalPlayer = { id: 0, name: '' } as Player;
    this.validationResult = undefined;
  }

  onEditClick(player: Player) {
    this.modalPlayer = { ...player };
    this.setModalOpen(true);
  }

  onDeleteClick(player: Player) {
    localDatabase.players.delete(player.id);
    this.setModalOpen(false);
    this.loadPlayers();
  }

  private async loadPlayers() {
    this.players = await localDatabase.players.toArray();
  }
}

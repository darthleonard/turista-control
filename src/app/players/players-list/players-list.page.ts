import { Component, OnInit, ViewChild } from '@angular/core';
import { IonModal } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core/components';
import { Player } from '../../database/local-database';
import { PlayerService } from '../../services/player.service';

@Component({
  selector: 'app-players-list',
  templateUrl: './players-list.page.html',
  styleUrls: ['./players-list.page.scss'],
  standalone: false,
})
export class PlayersListPage implements OnInit {
  @ViewChild(IonModal) private readonly modal!: IonModal;

  constructor(private playerService: PlayerService) {}

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
      await this.playerService.update(this.modalPlayer.id, {
        name: this.modalPlayer.name.toUpperCase(),
        image: this.modalPlayer.image,
      });
    } else {
      await this.playerService.add({
        name: this.modalPlayer?.name.toUpperCase(),
        image: this.modalPlayer?.image,
      } as Player);
    }

    this.setModalOpen(false);
    await this.loadPlayers();
  }

  onModalWillDismiss(event: CustomEvent<OverlayEventDetail>) {
    this.modalPlayer = { id: 0, name: '', image: 'assets/avatar/notset.png' };
    this.validationResult = undefined;
  }

  onEditClick(player: Player) {
    this.modalPlayer = { ...player };
    this.setModalOpen(true);
  }

  async onDeleteClick(player: Player) {
    if (player.id) {
      await this.playerService.delete(player.id);
    }
    this.setModalOpen(false);
    this.loadPlayers();
  }

  private async loadPlayers() {
    this.players = await this.playerService.getAll();
  }
}

import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  localDatabase,
  GameConfig,
  Player,
} from '../../database/local-database';
import { PlayersComponent } from '../players/players.component';

@Component({
  selector: 'app-game-config',
  templateUrl: './game-config.component.html',
  styleUrls: ['./game-config.component.css'],
  standalone: false,
})
export class GameConfigComponent {
  form: FormGroup;
  selectedPlayers: Player[] = [];
  bankPlayerId?: number;

  constructor(private modalCtrl: ModalController, private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      initialMoney: [1500, [Validators.required, Validators.min(1)]],
      boardConfig: ['default', Validators.required],
    });
  }

  /** Abrir modal para seleccionar jugadores */
  async openPlayersModal() {
    const modal = await this.modalCtrl.create({
      component: PlayersComponent,
      componentProps: { isSelectionMode: true },
    });
    await modal.present();

    const { data } = await modal.onWillDismiss<{
      players: Player[];
      bankPlayerId?: number;
    }>();
    if (data) {
      this.selectedPlayers = data.players;
      this.bankPlayerId = data.bankPlayerId ?? this.selectedPlayers[0]?.id;
    }
  }

  /** Guardar configuración */
  async save() {
    if (this.form.invalid || this.selectedPlayers.length === 0) {
      alert('Completa todos los campos y selecciona jugadores');
      return;
    }

    const config: GameConfig = {
      name: this.form.value.name,
      initialMoney: this.form.value.initialMoney,
      boardConfig: this.form.value.boardConfig,
      playerIds: this.selectedPlayers.map((p) => p.id),
      bankPlayerId: this.bankPlayerId ?? this.selectedPlayers[0].id,
      createdAt: new Date(),
    };

    const id = await localDatabase.gameConfigs.add(config);
    const savedConfig = await localDatabase.gameConfigs.get(id);

    this.modalCtrl.dismiss(savedConfig);
  }

  cancel() {
    this.modalCtrl.dismiss();
  }
}

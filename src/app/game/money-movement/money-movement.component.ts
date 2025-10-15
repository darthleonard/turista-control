import { Component, EventEmitter, Output } from '@angular/core';
import { AlertInput } from '@ionic/angular';

@Component({
  selector: 'app-money-movement',
  templateUrl: './money-movement.component.html',
  styleUrls: ['./money-movement.component.scss'],
  standalone: false,
})
export class MoneyMovementComponent {
  @Output() done = new EventEmitter<number>();
  private sign: string = '';

  title = '';
  isAlertOpen = false;
  alertButtons = [
    {
      text: 'Cancel',
      role: 'cancel',
      handler: () => {},
    },
    {
      text: 'OK',
      role: 'confirm',
      handler: (data: { amount: number }) => {
        console.log('Amount entered:', data.amount);
        let value = data.amount;
        if (this.sign === '-') {
          value = -Math.abs(value);
        }
        this.done.emit(Number(value));
      },
    },
  ];
  alertInputs!: AlertInput[];

  setOpen(isOpen: boolean, title?: string, sign?: string) {
    this.title = title || '';
    this.sign = sign || '';
    if (isOpen) {
      this.alertInputs = [
        {
          name: 'amount',
          type: 'number',
          placeholder: 'Enter amount',
          value: '',
        },
      ];
    }
    this.isAlertOpen = isOpen;
  }
}

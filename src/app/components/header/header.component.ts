import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  standalone: false,
})
export class HeaderComponent {
  constructor() {}

  @Input() title: string = 'App Header';
  @Input() defaultHref?: string;
}

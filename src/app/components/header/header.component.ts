import { Component, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  standalone: false,
})
export class HeaderComponent {
  @Input() title: string = 'App Header';
  @Input() defaultHref?: string;

  constructor(private translate: TranslateService) {}

  get translatedTitle(): string {
    // If the title looks like a translation key, translate it, else return as is
    if (
      this.title &&
      (this.title === this.title.toUpperCase() || this.title.includes('_'))
    ) {
      return this.translate.instant(this.title);
    }
    return this.title;
  }
}

import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: false,
})
export class SettingsPage implements OnInit {
  selectedLanguage = 'en';

  constructor(private translate: TranslateService) {}

  ngOnInit() {
    this.selectedLanguage =
      this.translate.currentLang || this.translate.getDefaultLang() || 'en';
  }

  changeLanguage(event: any) {
    const lang = event.detail ? event.detail.value : event;
    this.selectedLanguage = lang;
  }

  onSave() {
    this.translate.use(this.selectedLanguage);
  }
}

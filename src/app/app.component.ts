import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LocalDatabaseSeeder } from './database/local-database-seeder';
import { localDatabase } from './database/local-database';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  constructor(private translate: TranslateService) {
    this.translate.setDefaultLang('es');
    this.translate.use('es');
  }

  loaded = false;

  ngOnInit() {
    //this.loaded = true;
    LocalDatabaseSeeder.seed(localDatabase).then(() => {
      this.loaded = true;
    });
  }
}

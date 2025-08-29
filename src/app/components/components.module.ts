import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from './header/header.component';
import { MenuComponent } from './menu/menu.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [MenuComponent, HeaderComponent],
  imports: [
    CommonModule,
    IonicModule.forRoot(),
    RouterModule,
    ReactiveFormsModule,
    TranslateModule,
  ],
  exports: [MenuComponent, HeaderComponent],
  providers: [DatePipe],
})
export class ComponentsModule {}

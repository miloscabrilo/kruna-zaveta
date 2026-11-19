import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FEATURED_DONORS } from '../../core/content/donors';
import { NEWS } from '../../core/content/news';
import { I18n } from '../../core/i18n/i18n.service';
import { LocalizedPipe, TranslatePipe } from '../../core/i18n/translate.pipe';
import { Icon } from '../../shared/icon';

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslatePipe, LocalizedPipe, Icon],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  protected readonly i18n = inject(I18n);
  protected readonly news = NEWS;
  protected readonly donors = FEATURED_DONORS;

  constructor() {
    effect(() => this.i18n.setPageTitle());
  }
}

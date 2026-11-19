import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FEATURED_DONORS, OTHER_DONORS } from '../../core/content/donors';
import { I18n } from '../../core/i18n/i18n.service';
import { LocalizedPipe, TranslatePipe } from '../../core/i18n/translate.pipe';
import { Icon } from '../../shared/icon';
import { initials } from '../../shared/initials';

@Component({
  selector: 'app-donors',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslatePipe, LocalizedPipe, Icon],
  templateUrl: './donors.html',
  styleUrl: './donors.scss',
})
export class Donors {
  protected readonly i18n = inject(I18n);
  protected readonly featured = FEATURED_DONORS;
  protected readonly others = OTHER_DONORS;
  protected readonly initials = initials;

  constructor() {
    effect(() => this.i18n.setPageTitle(this.i18n.t('donors.title')));
  }
}

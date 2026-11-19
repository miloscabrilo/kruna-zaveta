import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TEAM } from '../../core/content/team';
import { I18n } from '../../core/i18n/i18n.service';
import { LocalizedPipe, TranslatePipe } from '../../core/i18n/translate.pipe';
import { Icon, IconName } from '../../shared/icon';
import { initials } from '../../shared/initials';

@Component({
  selector: 'app-about',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslatePipe, LocalizedPipe, Icon],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About {
  protected readonly i18n = inject(I18n);
  protected readonly team = TEAM;
  protected readonly initials = initials;

  protected readonly values: { key: string; icon: IconName }[] = [
    { key: 'solidarity', icon: 'hands' },
    { key: 'humanity', icon: 'heart' },
    { key: 'unity', icon: 'community' },
    { key: 'transparency', icon: 'share' },
  ];

  constructor() {
    effect(() => this.i18n.setPageTitle(this.i18n.t('about.title')));
  }
}

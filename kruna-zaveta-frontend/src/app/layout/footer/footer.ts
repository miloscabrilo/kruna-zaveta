import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE } from '../../core/content/site';
import { I18n } from '../../core/i18n/i18n.service';
import { LocalizedPipe, TranslatePipe } from '../../core/i18n/translate.pipe';
import { Icon } from '../../shared/icon';
import { Logo } from '../../shared/logo';
import { NAV_ITEMS } from '../../shared/nav-items';
import { SocialLinks } from '../../shared/social-links';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslatePipe, LocalizedPipe, Icon, Logo, SocialLinks],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  protected readonly i18n = inject(I18n);
  protected readonly navItems = NAV_ITEMS;
  protected readonly site = SITE;
  protected readonly year = new Date().getFullYear();
}

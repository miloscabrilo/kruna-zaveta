import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, map } from 'rxjs';
import { I18n } from '../../core/i18n/i18n.service';
import { LANGUAGE_LABELS, LANGUAGES, Lang } from '../../core/i18n/languages';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { Icon } from '../../shared/icon';
import { Logo } from '../../shared/logo';
import { NAV_ITEMS } from '../../shared/nav-items';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, TranslatePipe, Icon, Logo],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  host: {
    '(document:keydown.escape)': 'menuOpen.set(false)',
    '(window:scroll)': 'onScroll()',
  },
})
export class Header {
  private readonly router = inject(Router);
  protected readonly i18n = inject(I18n);

  protected readonly navItems = NAV_ITEMS;
  protected readonly languages = LANGUAGES;
  protected readonly labels = LANGUAGE_LABELS;
  protected readonly menuOpen = signal(false);
  /** Adds a shadow once the page is scrolled, so the header stands out from the content below. */
  protected readonly scrolled = signal(false);

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  /** The current path without the language prefix, so switching language keeps the page. */
  private readonly pathSegments = computed(() => {
    const path = this.url().split(/[?#]/)[0];
    return path.split('/').filter(Boolean).slice(1);
  });

  protected linkFor(lang: Lang): string[] {
    return ['/', lang, ...this.pathSegments()];
  }

  protected onScroll(): void {
    this.scrolled.set(window.scrollY > 4);
  }

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected selectLanguage(lang: Lang): void {
    this.i18n.savePreference(lang);
    this.closeMenu();
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }
}

import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE } from '../../core/content/site';
import { giroCodePayload } from '../../core/girocode';
import { I18n } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { Icon } from '../../shared/icon';
import { QrCode } from '../../shared/qr-code';
import { SocialLinks } from '../../shared/social-links';

type Method = 'eur' | 'paypal' | 'rsd';

@Component({
  selector: 'app-donate',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslatePipe, Icon, QrCode, SocialLinks],
  templateUrl: './donate.html',
  styleUrl: './donate.scss',
})
export class Donate {
  protected readonly i18n = inject(I18n);
  protected readonly payments = SITE.payments;
  protected readonly copiedField = signal<string | null>(null);

  /** Serbian visitors most likely pay in dinars, everyone else in euro. */
  protected readonly methods = computed<Method[]>(() => {
    const methods: Method[] = this.i18n.lang() === 'sr' ? ['rsd', 'eur', 'paypal'] : ['eur', 'paypal', 'rsd'];
    return methods.filter((method) => method !== 'paypal' || !!this.payments.paypalUrl);
  });

  protected readonly giroCode = computed(() =>
    giroCodePayload({
      recipient: this.payments.eur.recipient,
      iban: this.payments.eur.iban,
      bic: this.payments.eur.bic,
      reference: this.i18n.t('donate.referenceValue'),
    }),
  );

  constructor() {
    effect(() => this.i18n.setPageTitle(this.i18n.t('donate.title')));
  }

  protected async copy(field: string, value: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(field === 'rsd' ? value : value.replace(/\s/g, ''));
      this.copiedField.set(field);
      setTimeout(() => this.copiedField.set(null), 2000);
    } catch {
      // Clipboard not available (e.g. insecure context) – the value is still visible and selectable.
    }
  }
}

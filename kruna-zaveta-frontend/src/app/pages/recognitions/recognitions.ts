import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { RECOGNITIONS } from '../../core/content/recognitions';
import { I18n } from '../../core/i18n/i18n.service';
import { LocalizedPipe, TranslatePipe } from '../../core/i18n/translate.pipe';
import { Icon } from '../../shared/icon';

@Component({
  selector: 'app-recognitions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, LocalizedPipe, Icon],
  template: `
    <section class="section container">
      <header class="section__header">
        <h1>{{ 'recognitions.title' | t }}</h1>
        <p class="lead">{{ 'recognitions.intro' | t }}</p>
      </header>

      <ul class="card-grid recognitions">
        @for (item of recognitions; track item.id) {
          <li class="card recognition">
            @if (item.image) {
              <img class="recognition__image" [src]="item.image" [alt]="item.title | localized" loading="lazy" />
            } @else {
              <div class="recognition__badge"><app-icon name="award" /></div>
            }
            <div class="card__body">
              <span class="badge recognition__year">{{ item.year }}</span>
              <h2 class="recognition__title">{{ item.title | localized }}</h2>
              <p class="recognition__issuer">{{ item.issuer | localized }}</p>
              <p>{{ item.description | localized }}</p>
            </div>
          </li>
        }
      </ul>
    </section>
  `,
  styles: `
    .recognitions { margin: 0; padding: 0; list-style: none; }
    .recognition { border-top: 4px solid var(--color-gold); }
    .recognition__badge {
      display: grid; place-items: center; height: 8.5rem; --icon-size: 3.5rem;
      background: linear-gradient(135deg, var(--color-gold-soft), #efe0b0); color: var(--color-primary);
    }
    /* Scans of certificates are often portrait – show them whole. */
    .recognition__image { display: block; width: 100%; height: 12rem; object-fit: contain; background: var(--color-gold-soft); }
    .recognition__year { align-self: flex-start; background: var(--color-gold-soft); color: #7a5a00; }
    .recognition__title { margin: 0.6rem 0 0.2rem; font-size: 1.2rem; }
    .recognition__issuer { margin-bottom: 0.75rem !important; font-weight: 600; color: var(--color-primary); }
  `,
})
export class Recognitions {
  private readonly i18n = inject(I18n);
  protected readonly recognitions = RECOGNITIONS;

  constructor() {
    effect(() => this.i18n.setPageTitle(this.i18n.t('recognitions.title')));
  }
}

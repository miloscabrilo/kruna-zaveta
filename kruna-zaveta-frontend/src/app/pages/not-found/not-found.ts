import { ChangeDetectionStrategy, Component, RESPONSE_INIT, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18n } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

@Component({
  selector: 'app-not-found',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslatePipe],
  template: `
    <section class="section container not-found">
      <h1>{{ 'notFound.title' | t }}</h1>
      <p class="lead">{{ 'notFound.text' | t }}</p>
      <a class="btn btn--primary" [routerLink]="['/', i18n.lang()]">{{ 'notFound.back' | t }}</a>
    </section>
  `,
  styles: `.not-found { text-align: center; padding-block: 5rem; }`,
})
export class NotFound {
  protected readonly i18n = inject(I18n);

  constructor() {
    // During server rendering, answer with a real 404 so search engines don't index the page.
    const response = inject(RESPONSE_INIT, { optional: true });
    if (response) {
      response.status = 404;
    }
    effect(() => this.i18n.setPageTitle(this.i18n.t('notFound.title')));
  }
}

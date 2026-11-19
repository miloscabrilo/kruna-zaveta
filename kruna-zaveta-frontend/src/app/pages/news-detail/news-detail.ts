import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { findNews } from '../../core/content/news';
import { I18n } from '../../core/i18n/i18n.service';
import { LocalizedPipe, TranslatePipe } from '../../core/i18n/translate.pipe';
import { Icon } from '../../shared/icon';

@Component({
  selector: 'app-news-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslatePipe, LocalizedPipe, Icon],
  templateUrl: './news-detail.html',
  styleUrl: './news-detail.scss',
})
export class NewsDetail {
  protected readonly i18n = inject(I18n);

  /** Bound from the `:slug` route parameter. */
  readonly slug = input.required<string>();

  protected readonly item = computed(() => findNews(this.slug()));

  constructor() {
    effect(() => {
      const item = this.item();
      this.i18n.setPageTitle(item ? this.i18n.pick(item.title) : this.i18n.t('notFound.title'));
    });
  }
}

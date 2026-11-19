import { Pipe, PipeTransform, inject } from '@angular/core';
import { I18n } from './i18n.service';
import { Localized } from './languages';

/** `{{ 'nav.home' | t }}` – impure so it re-evaluates when the language signal changes. */
@Pipe({ name: 't', pure: false })
export class TranslatePipe implements PipeTransform {
  private readonly i18n = inject(I18n);

  transform(key: string): string {
    return this.i18n.t(key);
  }
}

/** `{{ item.title | localized }}` for content objects that carry every language. */
@Pipe({ name: 'localized', pure: false })
export class LocalizedPipe implements PipeTransform {
  private readonly i18n = inject(I18n);

  transform<T>(value: Localized<T>): T {
    return this.i18n.pick(value);
  }
}

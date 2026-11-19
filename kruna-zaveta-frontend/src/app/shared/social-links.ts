import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SITE } from '../core/content/site';
import { Icon } from './icon';

@Component({
  selector: 'app-social-links',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  styles: `
    ul { display: flex; flex-wrap: wrap; gap: 0.5rem; margin: 0; padding: 0; list-style: none; }
    a {
      display: inline-flex; align-items: center; justify-content: center;
      width: 2.75rem; height: 2.75rem; border-radius: 50%;
      background: var(--social-bg, var(--color-primary-soft)); color: var(--social-fg, var(--color-primary));
      --icon-size: 1.3rem; transition: transform 0.15s;
    }
    a:hover { transform: translateY(-2px); }
  `,
  template: `
    <ul>
      @for (link of links; track link.id) {
        <li>
          <a [href]="link.url" target="_blank" rel="noopener noreferrer" [attr.aria-label]="link.label" [title]="link.label">
            <app-icon [name]="link.id" />
          </a>
        </li>
      }
    </ul>
  `,
})
export class SocialLinks {
  protected readonly links = SITE.social;
}

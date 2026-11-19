import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type IconName =
  | 'facebook'
  | 'instagram'
  | 'youtube'
  | 'tiktok'
  | 'viber'
  | 'mail'
  | 'phone'
  | 'pin'
  | 'heart'
  | 'menu'
  | 'close'
  | 'food'
  | 'heating'
  | 'education'
  | 'health'
  | 'community'
  | 'hands'
  | 'share'
  | 'box'
  | 'award';

/** Small inline SVG icon set (stroke icons, inherit `currentColor`). */
@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
  styles: `
    :host { display: inline-flex; width: var(--icon-size, 1.25em); height: var(--icon-size, 1.25em); }
    svg { width: 100%; height: 100%; }
  `,
  template: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
         stroke-linecap="round" stroke-linejoin="round">
      @switch (name()) {
        @case ('facebook') { <path d="M15 3h-2.5A3.5 3.5 0 0 0 9 6.5V9H7v3h2v9h3v-9h2.5l.5-3h-3V6.8c0-.5.3-.8.8-.8H15z" /> }
        @case ('instagram') { <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".6" fill="currentColor" /> }
        @case ('youtube') { <rect x="2" y="5" width="20" height="14" rx="4" /><path d="m10 9 5 3-5 3z" fill="currentColor" /> }
        @case ('viber') { <path d="M12 3c5 0 8.5 2.6 8.5 7.5S17 18 12 18c-.9 0-1.7-.1-2.5-.3L6 20.5V17c-1.7-1.4-2.5-3.7-2.5-6.5C3.5 5.6 7 3 12 3z" /><path d="M8.5 8.2c0 3 2.3 5.3 5.3 5.3l.9-1.1-1.5-1-.8.5a3.3 3.3 0 0 1-1.8-1.8l.5-.8-1-1.5zM13 6.5a4 4 0 0 1 4 4M13 8.5a2 2 0 0 1 2 2" /> }
        @case ('tiktok') { <path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5M14 3c.5 2.5 2.3 4.2 5 4.5" /> }
        @case ('mail') { <rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /> }
        @case ('phone') { <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" /> }
        @case ('pin') { <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /> }
        @case ('heart') { <path d="M12 20s-7.5-4.6-9.3-9.2C1.5 7.4 3.7 4 7.2 4c2 0 3.6 1.1 4.8 2.8C13.2 5.1 14.8 4 16.8 4c3.5 0 5.7 3.4 4.5 6.8C19.5 15.4 12 20 12 20z" /> }
        @case ('menu') { <path d="M4 7h16M4 12h16M4 17h16" /> }
        @case ('close') { <path d="M6 6l12 12M18 6 6 18" /> }
        @case ('food') { <path d="M4 11h16a8 8 0 0 1-16 0zM8 7c0-1 1-1.5 1-2.5M12 7c0-1 1-1.5 1-2.5M16 7c0-1 1-1.5 1-2.5" /> }
        @case ('heating') { <path d="M12 21a6 6 0 0 0 6-6c0-4-3-6-4-10-2 2-3 4-3 6-1-1-1.5-2-1.5-3C7 10 6 12.5 6 15a6 6 0 0 0 6 6z" /> }
        @case ('education') { <path d="m2 9 10-5 10 5-10 5zM6 11v5c2 2 10 2 12 0v-5M22 9v6" /> }
        @case ('health') { <rect x="3" y="3" width="18" height="18" rx="4" /><path d="M12 8v8M8 12h8" /> }
        @case ('community') { <circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2.5" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M15 14.5c3 0 6 1.8 6 5" /> }
        @case ('hands') { <path d="M7 11V6.5a1.5 1.5 0 0 1 3 0V11m0-1V4.5a1.5 1.5 0 0 1 3 0V11m0-.5V6a1.5 1.5 0 0 1 3 0v7c0 4-2.5 8-7 8-3 0-4.5-2-6-4.5L3.5 13a1.5 1.5 0 0 1 2.6-1.5L7 13" /> }
        @case ('share') { <circle cx="18" cy="5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="19" r="2.5" /><path d="m8.2 10.8 7.6-4.4M8.2 13.2l7.6 4.4" /> }
        @case ('award') { <circle cx="12" cy="9" r="6" /><path d="M8.5 13.9 7 22l5-3 5 3-1.5-8.1M12 6.5l.8 1.6 1.7.3-1.2 1.2.3 1.7-1.6-.8-1.6.8.3-1.7-1.2-1.2 1.7-.3z" /> }
        @case ('box') { <path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5zM3 7.5l9 4.5 9-4.5M12 12v9" /> }
      }
    </svg>
  `,
})
export class Icon {
  readonly name = input.required<IconName>();
}

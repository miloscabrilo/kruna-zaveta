import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Placeholder crown mark – replace with the organization's real logo when available. */
@Component({
  selector: 'app-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
  styles: `
    :host { display: inline-flex; width: 2.25rem; height: 2.25rem; color: var(--color-gold); }
    svg { width: 100%; height: 100%; }
  `,
  template: `
    <svg viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="var(--color-primary)" />
      <path d="M12 31 10 16l8 6 6-10 6 10 8-6-2 15z" fill="currentColor" />
      <rect x="12" y="33" width="24" height="3.5" rx="1" fill="currentColor" />
      <path d="M24 17v8M21 20h6" stroke="var(--color-primary)" stroke-width="2" stroke-linecap="round" />
    </svg>
  `,
})
export class Logo {}

import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  input,
  output,
} from '@angular/core';

/** Minimal typing of the Cloudflare Turnstile browser API we use. */
interface TurnstileApi {
  render(element: HTMLElement, options: Record<string, unknown>): string;
  reset(widgetId: string): void;
  remove(widgetId: string): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
let scriptLoading: Promise<TurnstileApi> | undefined;

function loadTurnstile(document: Document): Promise<TurnstileApi> {
  scriptLoading ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error('Turnstile missing')));
    script.onerror = () => {
      scriptLoading = undefined; // allow a retry on the next visit to the form
      reject(new Error('Turnstile could not be loaded'));
    };
    document.head.appendChild(script);
  });
  return scriptLoading;
}

/**
 * Cloudflare Turnstile captcha. Usually invisible or a single click; emits a one-time token
 * that the backend verifies. Rendered only in the browser.
 */
@Component({
  selector: 'app-turnstile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `:host { display: block; min-height: 65px; }`,
  template: ``,
})
export class Turnstile {
  readonly siteKey = input.required<string>();
  readonly language = input('auto');
  /** A fresh token, or null when it expired or the check failed. */
  readonly token = output<string | null>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly document = inject(DOCUMENT);
  private api?: TurnstileApi;
  private widgetId?: string;

  constructor() {
    afterNextRender(() => {
      loadTurnstile(this.document)
        .then((api) => {
          this.api = api;
          this.widgetId = api.render(this.host.nativeElement, {
            sitekey: this.siteKey(),
            language: this.language(),
            action: 'contact',
            callback: (token: string) => this.token.emit(token),
            'expired-callback': () => this.token.emit(null),
            'error-callback': () => this.token.emit(null),
          });
        })
        .catch(() => this.token.emit(null));
    });
    inject(DestroyRef).onDestroy(() => {
      if (this.widgetId) this.api?.remove(this.widgetId);
    });
  }

  /** Tokens are single-use: get a new one after every submit. */
  reset(): void {
    if (this.widgetId) {
      this.api?.reset(this.widgetId);
      this.token.emit(null);
    }
  }
}

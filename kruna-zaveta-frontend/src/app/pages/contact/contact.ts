import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, viewChild } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { SITE } from '../../core/content/site';
import { ContactService } from '../../core/contact.service';
import { I18n } from '../../core/i18n/i18n.service';
import { LocalizedPipe, TranslatePipe } from '../../core/i18n/translate.pipe';
import { Icon } from '../../shared/icon';
import { SocialLinks } from '../../shared/social-links';
import { Turnstile } from '../../shared/turnstile';

// Keep in sync with the backend validation (kruna-zaveta-backend/src/validation.ts).
export const CONTACT_LIMITS = { name: 100, email: 200, subject: 150, message: 5000 } as const;

type Status = 'idle' | 'sending' | 'success' | 'error' | 'captcha' | 'dailyLimit';

@Component({
  selector: 'app-contact',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, TranslatePipe, LocalizedPipe, Icon, SocialLinks, Turnstile],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact {
  private readonly i18n = inject(I18n);
  private readonly contactService = inject(ContactService);

  protected readonly site = SITE;
  protected readonly limits = CONTACT_LIMITS;
  protected readonly status = signal<Status>('idle');

  protected readonly captchaSiteKey = environment.turnstileSiteKey;
  protected readonly captchaToken = signal<string | null>(null);
  private readonly captcha = viewChild(Turnstile);
  /** Turnstile has English and German texts; for Serbian it follows the browser's language. */
  protected readonly captchaLanguage = computed(() => (this.i18n.lang() === 'sr' ? 'auto' : this.i18n.lang()));

  protected readonly form = inject(NonNullableFormBuilder).group({
    name: ['', [Validators.required, Validators.maxLength(CONTACT_LIMITS.name)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(CONTACT_LIMITS.email)]],
    subject: ['', [Validators.maxLength(CONTACT_LIMITS.subject)]],
    message: ['', [Validators.required, Validators.maxLength(CONTACT_LIMITS.message)]],
    website: [''],
  });

  constructor() {
    effect(() => this.i18n.setPageTitle(this.i18n.t('contact.title')));
  }

  /** Translation key of the first error to show for a control, once the user has interacted with it. */
  protected errorKey(name: keyof typeof this.form.controls): string | null {
    const control = this.form.controls[name];
    if (!control.invalid || !(control.touched || control.dirty)) {
      return null;
    }
    if (control.hasError('required')) return 'contact.required';
    if (control.hasError('email')) return 'contact.invalidEmail';
    if (control.hasError('maxlength')) return 'contact.tooLong';
    return null;
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const captchaToken = this.captchaToken();
    if (!captchaToken) {
      this.status.set('captcha');
      return;
    }

    this.status.set('sending');
    const value = this.form.getRawValue();
    this.contactService.send({ ...value, captchaToken, language: this.i18n.lang() }).subscribe({
      next: () => {
        this.status.set('success');
        this.form.reset();
        this.captcha()?.reset();
      },
      error: (error: HttpErrorResponse) => {
        const code = error.error?.error;
        this.status.set(code === 'dailyLimit' ? 'dailyLimit' : code === 'captcha' ? 'captcha' : 'error');
        this.captcha()?.reset();
      },
    });
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Lang } from './i18n/languages';

export interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
  language: Lang;
  /** Honeypot – must stay empty; bots tend to fill every field. */
  website: string;
  /** One-time Cloudflare Turnstile token. */
  captchaToken: string;
}

@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly http = inject(HttpClient);

  send(message: ContactMessage): Observable<{ ok: true }> {
    return this.http.post<{ ok: true }>(`${environment.apiUrl}/contact`, message);
  }
}

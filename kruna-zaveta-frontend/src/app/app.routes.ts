import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { I18n } from './core/i18n/i18n.service';
import { langGuard } from './core/i18n/lang.guard';

/** Page paths under `/:lang`. Also used to generate the prerendered routes (app.routes.server.ts). */
export const PAGE_PATHS = ['', 'what-we-have-done', 'recognitions', 'about', 'donors', 'donate', 'contact'] as const;

export const routes: Routes = [
  // "/" opens the language the visitor chose last time (rendered in the browser, see app.routes.server.ts).
  { path: '', pathMatch: 'full', redirectTo: () => inject(I18n).preferredLanguage() },
  {
    path: ':lang',
    canActivate: [langGuard],
    children: [
      { path: '', loadComponent: () => import('./pages/home/home').then((m) => m.Home) },
      { path: 'news/:slug', loadComponent: () => import('./pages/news-detail/news-detail').then((m) => m.NewsDetail) },
      { path: 'what-we-have-done', loadComponent: () => import('./pages/projects/projects').then((m) => m.Projects) },
      { path: 'recognitions', loadComponent: () => import('./pages/recognitions/recognitions').then((m) => m.Recognitions) },
      { path: 'about', loadComponent: () => import('./pages/about/about').then((m) => m.About) },
      { path: 'who-we-are', redirectTo: 'about' }, // merged into "About us"
      { path: 'donors', loadComponent: () => import('./pages/donors/donors').then((m) => m.Donors) },
      { path: 'donate', loadComponent: () => import('./pages/donate/donate').then((m) => m.Donate) },
      { path: 'contact', loadComponent: () => import('./pages/contact/contact').then((m) => m.Contact) },
      { path: '**', loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound) },
    ],
  },
];

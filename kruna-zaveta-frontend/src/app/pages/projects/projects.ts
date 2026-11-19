import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { PROJECTS } from '../../core/content/projects';
import { I18n } from '../../core/i18n/i18n.service';
import { LocalizedPipe, TranslatePipe } from '../../core/i18n/translate.pipe';
import { Icon } from '../../shared/icon';

@Component({
  selector: 'app-projects',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, LocalizedPipe, Icon],
  template: `
    <section class="section container">
      <header class="section__header">
        <h1>{{ 'projects.title' | t }}</h1>
        <p class="lead">{{ 'projects.intro' | t }}</p>
      </header>

      <div class="card-grid">
        @for (project of projects; track project.id) {
          <article class="card">
            <div class="topic-banner" [attr.data-topic]="project.topic">
              <app-icon [name]="project.topic" />
            </div>
            <div class="card__body">
              <div class="project__meta">
                <span>{{ project.period }}</span>
                <span class="badge" [class.badge--ongoing]="project.status === 'ongoing'">
                  {{ (project.status === 'done' ? 'projects.statusDone' : 'projects.statusOngoing') | t }}
                </span>
              </div>
              <h2 class="project__title">{{ project.title | localized }}</h2>
              <p>{{ project.description | localized }}</p>
            </div>
          </article>
        }
      </div>
    </section>
  `,
  styles: `
    .project__meta { display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; color: var(--color-muted); }
    .project__title { margin: 0.5rem 0; font-size: 1.2rem; }
  `,
})
export class Projects {
  private readonly i18n = inject(I18n);
  protected readonly projects = PROJECTS;

  constructor() {
    effect(() => this.i18n.setPageTitle(this.i18n.t('projects.title')));
  }
}

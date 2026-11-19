import { Localized } from '../i18n/languages';
import { Topic } from './news';

export interface Project {
  id: string;
  period: string; // free text, e.g. "2025" or "2024 – 2025"
  status: 'done' | 'ongoing';
  topic: Topic;
  title: Localized;
  description: Localized;
}

// SAMPLE CONTENT – illustrative projects only, replace with the organization's real activities.
export const PROJECTS: Project[] = [
  {
    id: 'winter-heating',
    period: '2026',
    status: 'ongoing',
    topic: 'heating',
    title: { sr: 'Топло за зиму', en: 'Warm for the winter', de: 'Warm durch den Winter' },
    description: {
      sr: 'Набавка и достава огрева породицама које не могу саме да обезбеде грејање.',
      en: 'Buying and delivering firewood to families who cannot afford heating themselves.',
      de: 'Beschaffung und Lieferung von Brennholz an Familien, die sich das Heizen nicht leisten können.',
    },
  },
  {
    id: 'back-to-school',
    period: '2026',
    status: 'done',
    topic: 'education',
    title: { sr: 'Спремни за школу', en: 'Ready for school', de: 'Bereit für die Schule' },
    description: {
      sr: 'Ранчеви, свеске и школски прибор за децу из угрожених породица.',
      en: 'Backpacks, notebooks and school supplies for children from families in need.',
      de: 'Schulranzen, Hefte und Schulmaterial für Kinder aus bedürftigen Familien.',
    },
  },
  {
    id: 'food-packages',
    period: '2025 – 2026',
    status: 'done',
    topic: 'food',
    title: { sr: 'Пакети хране', en: 'Food packages', de: 'Lebensmittelpakete' },
    description: {
      sr: 'Редовна подела пакета са основним намирницама и хигијенским производима.',
      en: 'Regular distribution of packages with basic groceries and hygiene products.',
      de: 'Regelmäßige Verteilung von Paketen mit Grundnahrungsmitteln und Hygieneartikeln.',
    },
  },
  {
    id: 'medical-help',
    period: '2025',
    status: 'done',
    topic: 'health',
    title: { sr: 'Помоћ за лечење', en: 'Medical support', de: 'Medizinische Hilfe' },
    description: {
      sr: 'Помоћ при набавци лекова и трошковима лечења за болесне и старије особе.',
      en: 'Help with medicines and treatment costs for sick and elderly people.',
      de: 'Unterstützung bei Medikamenten und Behandlungskosten für kranke und ältere Menschen.',
    },
  },
];

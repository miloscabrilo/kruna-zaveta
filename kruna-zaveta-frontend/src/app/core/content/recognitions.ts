import { Localized } from '../i18n/languages';

export interface Recognition {
  id: string;
  /** Year it was received (newest first in the list below). */
  year: number;
  title: Localized;
  /** Who gave it – institution, church, municipality, school … */
  issuer: Localized;
  description: Localized;
  /** Optional photo or scan under public/, e.g. "/images/recognitions/plaque-2025.jpg". */
  image?: string;
}

const placeholderIssuer: Localized = { sr: 'Назив институције', en: 'Institution name', de: 'Name der Institution' };

// SAMPLE CONTENT – placeholder entries, replace with the organization's real recognitions (newest first).
export const RECOGNITIONS: Recognition[] = [
  {
    id: 'recognition-1',
    year: 2025,
    title: {
      sr: 'Захвалница за хуманитарни рад',
      en: 'Letter of thanks for humanitarian work',
      de: 'Dankesurkunde für humanitäre Arbeit',
    },
    issuer: placeholderIssuer,
    description: {
      sr: 'Уручена као знак захвалности за помоћ угроженим породицама током зимских месеци.',
      en: 'Presented in gratitude for the help given to families in need during the winter months.',
      de: 'Überreicht als Dank für die Hilfe für bedürftige Familien in den Wintermonaten.',
    },
  },
  {
    id: 'recognition-2',
    year: 2024,
    title: {
      sr: 'Плакета за допринос заједници',
      en: 'Plaque for contribution to the community',
      de: 'Plakette für den Beitrag zur Gemeinschaft',
    },
    issuer: placeholderIssuer,
    description: {
      sr: 'Додељена за дугогодишњу подршку мештанима и локалној заједници.',
      en: 'Awarded for long-standing support of local residents and the community.',
      de: 'Verliehen für die langjährige Unterstützung der Bewohner und der örtlichen Gemeinschaft.',
    },
  },
  {
    id: 'recognition-3',
    year: 2024,
    title: {
      sr: 'Признање за помоћ школама',
      en: 'Recognition for supporting schools',
      de: 'Anerkennung für die Unterstützung von Schulen',
    },
    issuer: placeholderIssuer,
    description: {
      sr: 'За обезбеђивање школског прибора и опреме за ученике.',
      en: 'For providing school supplies and equipment for pupils.',
      de: 'Für die Bereitstellung von Schulmaterial und Ausstattung für Schülerinnen und Schüler.',
    },
  },
];

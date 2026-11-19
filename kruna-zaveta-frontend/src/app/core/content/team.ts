import { Localized } from '../i18n/languages';

export interface TeamMember {
  /** Cyrillic for Serbian, Latin for English and German. */
  name: Localized;
  role: Localized;
}

const placeholderName: Localized = { sr: 'Име Презиме', en: 'Name Surname', de: 'Vorname Nachname' };

// SAMPLE CONTENT – placeholder names, replace with the real team (and get their consent before publishing).
export const TEAM: TeamMember[] = [
  { name: placeholderName, role: { sr: 'Председник', en: 'President', de: 'Präsident' } },
  { name: placeholderName, role: { sr: 'Координатор на терену', en: 'Field coordinator', de: 'Koordination vor Ort' } },
  { name: placeholderName, role: { sr: 'Финансије', en: 'Finance', de: 'Finanzen' } },
  { name: placeholderName, role: { sr: 'Волонтери и комуникација', en: 'Volunteers & communication', de: 'Freiwillige & Kommunikation' } },
];

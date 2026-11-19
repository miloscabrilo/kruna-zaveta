import { Localized } from '../i18n/languages';

export interface Donor {
  id: string;
  /** Cyrillic for Serbian, Latin for English and German. */
  name: Localized;
  kind: 'individual' | 'company' | 'organization';
  /** Year of the first donation. */
  since: number;
  /** Words of thanks – what their support made possible. Only for featured donors. */
  tribute?: Localized;
}

// SAMPLE CONTENT – placeholder donors. Only list real donors with their explicit consent,
// and do not publish donation amounts.

/** Shown with a personal thank-you, in this order (also on the home page). */
export const FEATURED_DONORS: Donor[] = [
  {
    id: 'donor-1',
    name: { sr: 'Породица Петровић', en: 'The Petrović family', de: 'Familie Petrović' },
    kind: 'individual',
    since: 2023,
    tribute: {
      sr: 'Од самог почетка уз нас – захваљујући њима десетине породица дочекале су зиму на топлом.',
      en: 'With us from the very beginning – thanks to them, dozens of families spent the winter in warm homes.',
      de: 'Von Anfang an an unserer Seite – dank ihnen verbrachten Dutzende Familien den Winter im Warmen.',
    },
  },
  {
    id: 'donor-2',
    name: { sr: 'Компанија Пример д.о.о.', en: 'Example Company Ltd.', de: 'Beispiel GmbH' },
    kind: 'company',
    since: 2024,
    tribute: {
      sr: 'Обезбедили су школски прибор за сву децу у нашој акцији ’Спремни за школу’.',
      en: 'They provided school supplies for every child in our “Ready for school” campaign.',
      de: 'Sie haben das Schulmaterial für alle Kinder unserer Aktion ‚Bereit für die Schule‘ gespendet.',
    },
  },
  {
    id: 'donor-3',
    name: { sr: 'Српска заједница у Немачкој', en: 'Serbian community in Germany', de: 'Serbische Gemeinde in Deutschland' },
    kind: 'organization',
    since: 2024,
    tribute: {
      sr: 'Својим редовним прилозима омогућавају сталну поделу пакета хране.',
      en: 'Their regular contributions make our ongoing food package distribution possible.',
      de: 'Mit ihren regelmäßigen Beiträgen ermöglichen sie die laufende Verteilung von Lebensmittelpaketen.',
    },
  },
];

/** Listed by name only. */
export const OTHER_DONORS: Donor[] = [
  { id: 'donor-4', name: { sr: 'Марко Јовановић', en: 'Marko Jovanović', de: 'Marko Jovanović' }, kind: 'individual', since: 2025 },
  { id: 'donor-5', name: { sr: 'Ана Николић', en: 'Ana Nikolić', de: 'Ana Nikolić' }, kind: 'individual', since: 2025 },
  { id: 'donor-6', name: { sr: 'Пекара Код Јове', en: 'Kod Jove Bakery', de: 'Bäckerei Kod Jove' }, kind: 'company', since: 2026 },
];

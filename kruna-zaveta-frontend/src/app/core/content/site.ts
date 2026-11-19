// Organization details shown across the site.
// TODO: every value marked PLACEHOLDER must be replaced with the organization's real data before going live.
import { Localized } from '../i18n/languages';

export interface SocialLink {
  id: 'facebook' | 'instagram' | 'youtube' | 'tiktok' | 'viber';
  label: string;
  url: string;
}

export const SITE = {
  /** Public address of the site, used for canonical and language-alternate links. */
  url: 'https://krunazaveta.com',
  email: 'info@krunazaveta.com', // PLACEHOLDER – mailbox must exist
  phone: '', // PLACEHOLDER – leave empty to hide
  location: {
    sr: 'Косово и Метохија',
    en: 'Kosovo and Metohija',
    de: 'Kosovo und Metochien',
  } as Localized,
  social: [
    { id: 'facebook', label: 'Facebook', url: 'https://www.facebook.com/' }, // PLACEHOLDER
    { id: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/kruna.zaveta/' },
    { id: 'youtube', label: 'YouTube', url: 'https://www.youtube.com/' }, // PLACEHOLDER
    // Viber group invite link: in Viber open the group → Info → "Share group link" (https://invite.viber.com/?g2=…).
    { id: 'viber', label: 'Viber', url: 'https://invite.viber.com/?g2=PLACEHOLDER' }, // PLACEHOLDER
  ] as SocialLink[],
  payments: {
    /** Euro account for SEPA transfers (Germany, Austria, euro area). */
    eur: {
      recipient: 'Kruna Zaveta', // PLACEHOLDER
      iban: 'DE00 0000 0000 0000 0000 00', // PLACEHOLDER
      bic: 'XXXXXXXXXXX', // PLACEHOLDER
      bankName: 'Bank name, City', // PLACEHOLDER
    },
    /** Dinar account for domestic payments in Serbia. */
    rsd: {
      recipient: 'Круна Завета', // PLACEHOLDER
      accountNumber: '000-0000000000000-00', // PLACEHOLDER
      bankName: 'Назив банке, Град', // PLACEHOLDER
    },
    /** PayPal "Donate" link (paypal.com/donate/?hosted_button_id=…). Leave empty to hide. */
    paypalUrl: 'https://www.paypal.com/donate/?hosted_button_id=PLACEHOLDER', // PLACEHOLDER
  },
};

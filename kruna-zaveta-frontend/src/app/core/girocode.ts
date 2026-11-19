export interface SepaTransfer {
  recipient: string;
  iban: string;
  bic?: string;
  /** Free-text payment reference shown to the recipient. */
  reference?: string;
  /** Amount in EUR; omitted so donors choose it in their banking app. */
  amount?: number;
}

/**
 * Payload for an EPC QR code ("GiroCode", EPC069-12, version 002), which banking apps in Germany,
 * Austria and much of the euro area turn into a pre-filled SEPA credit transfer.
 */
export function giroCodePayload(transfer: SepaTransfer): string {
  return [
    'BCD', // service tag
    '002', // version – BIC optional within the EEA
    '1', // character set: UTF-8
    'SCT', // SEPA credit transfer
    (transfer.bic ?? '').replace(/\s/g, ''),
    transfer.recipient.slice(0, 70),
    transfer.iban.replace(/\s/g, '').toUpperCase(),
    transfer.amount ? `EUR${transfer.amount.toFixed(2)}` : '',
    '', // purpose code
    '', // structured creditor reference
    (transfer.reference ?? '').slice(0, 140),
  ].join('\n');
}

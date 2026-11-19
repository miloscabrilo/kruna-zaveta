import { giroCodePayload } from './girocode';

describe('giroCodePayload', () => {
  it('builds an EPC QR payload without amount', () => {
    const payload = giroCodePayload({
      recipient: 'Kruna Zaveta',
      iban: 'de89 3704 0044 0532 0130 00',
      bic: 'COBADEFFXXX',
      reference: 'Spende',
    });
    expect(payload.split('\n')).toEqual([
      'BCD', '002', '1', 'SCT', 'COBADEFFXXX', 'Kruna Zaveta', 'DE89370400440532013000', '', '', '', 'Spende',
    ]);
  });

  it('formats the amount in euro', () => {
    expect(giroCodePayload({ recipient: 'X', iban: 'DE00', amount: 25 }).split('\n')[7]).toBe('EUR25.00');
  });
});

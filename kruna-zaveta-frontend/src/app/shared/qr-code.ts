import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { create } from 'qrcode';

/** Renders text as a QR code SVG. Generated synchronously, so it is part of the prerendered HTML. */
@Component({
  selector: 'app-qr-code',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host { display: inline-block; padding: 0.5rem; border-radius: var(--radius); background: #fff; line-height: 0; }
    svg { width: var(--qr-size, 10rem); height: var(--qr-size, 10rem); }
  `,
  template: `
    <svg [attr.viewBox]="viewBox()" shape-rendering="crispEdges" role="img" [attr.aria-label]="label()">
      <path [attr.d]="path()" fill="#000" />
    </svg>
  `,
})
export class QrCode {
  readonly data = input.required<string>();
  readonly label = input('QR code');

  private readonly modules = computed(() => create(this.data(), { errorCorrectionLevel: 'M' }).modules);
  protected readonly viewBox = computed(() => {
    const size = this.modules().size + 2; // one module of quiet zone around it (the host adds more padding)
    return `-1 -1 ${size} ${size}`;
  });
  protected readonly path = computed(() => {
    const { size, data } = this.modules();
    let d = '';
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (data[y * size + x]) d += `M${x} ${y}h1v1h-1z`;
      }
    }
    return d;
  });
}

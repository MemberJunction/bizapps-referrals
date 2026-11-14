/**
 * Browser entry for the `<mj-referrals-finder>` Angular Element.
 * Bundled with the Angular linker (see build-referrals-finder-element.mjs) so public
 * embed pages do not need `unsafe-eval` / JIT.
 */
import 'zone.js';
import { CSP_NONCE, provideZoneChangeDetection } from '@angular/core';
import { createApplication } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { ReferralsFinderWidgetComponent } from '../dist/lib/finder-widget/referrals-finder-widget.component.js';

function readCspNonce(): string {
  const host = document.querySelector('mj-referrals-finder');
  const fromHost = host?.getAttribute('csp-nonce') || host?.getAttribute('ngcspnonce');
  if (fromHost) {
    return fromHost;
  }
  const tagged = document.querySelector<HTMLElement>('script[nonce], style[nonce]');
  return tagged?.nonce || tagged?.getAttribute('nonce') || '';
}

void createApplication({
  providers: [
    provideZoneChangeDetection(),
    { provide: CSP_NONCE, useFactory: readCspNonce },
  ],
})
  .then((app) => {
    if (!customElements.get('mj-referrals-finder')) {
      const el = createCustomElement(ReferralsFinderWidgetComponent, { injector: app.injector });
      customElements.define('mj-referrals-finder', el);
    }
  })
  .catch((err: unknown) => {
    console.error('[mj-referrals-finder] bootstrap failed', err);
  });

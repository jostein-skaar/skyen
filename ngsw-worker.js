/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// This is needed because I used service worker with Angular in earlier stages.
// May be deleted when all visitors have gotten the new app.

// tslint:disable:no-console

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
  self.registration.unregister().then(() => {
    console.log('NGSW Safety Worker - unregistered old service worker');
  });
});

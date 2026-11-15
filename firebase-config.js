// ============================================================
//  firebase-config.js — the only settings file
//
//  Everything you might want to change lives here: the Firebase
//  project, your UPI ID, the wording, your links. Commit a change
//  and the page updates itself in about a minute.
//
//  The Firebase config below is public by design: it identifies
//  your project, it does not grant access. What protects your data
//  is the Firestore rules (read + create only, never update/delete).
// ============================================================

window.BMAC_CONFIG = {

  // ---- Firebase project --------------------------------------
  firebase: {
    apiKey: "AIzaSyB9VvCN25LkGM2gePiMPhQ1lCKez_MyPl0",
    authDomain: "buy-me-a-coffee-197b7.firebaseapp.com",
    projectId: "buy-me-a-coffee-197b7",
    storageBucket: "buy-me-a-coffee-197b7.firebasestorage.app",
    messagingSenderId: "573190316198",
    appId: "1:573190316198:web:32f790af128ec66bd51467"
  },

  // Firestore collection that holds the supporter wall.
  collection: 'supporters',

  // ---- Payment ------------------------------------------------
  // Your UPI ID. Every QR code and "Open UPI App" button uses this.
  upiId: 'prashantkhati12345@okaxis',

  // ---- Wording ------------------------------------------------
  creatorName: 'Prashant',
  tagline: 'Fueling creativity, one coffee at a time ☕',
  thankYouMessage: 'Thank you for your support, it means a lot! ☕✨',

  // ---- Links --------------------------------------------------
  githubUrl: 'https://github.com/prakha194',

  // Your profile picture, shown in the yellow circle at the top.
  // The .png form of a GitHub profile gives the avatar image.
  avatarUrl: 'https://github.com/prakha194.png'

};

// ============================================================
//  Firestore data layer — no need to edit below this line.
//  Exposes window.dataSdk: init(), create(), list().
//  If the config above is blank, this leaves window.dataSdk
//  undefined and index.html falls back to local storage.
// ============================================================

(function () {
  var CFG = window.BMAC_CONFIG || {};
  var FB = CFG.firebase || {};
  var COLLECTION = CFG.collection || 'supporters';

  if (!FB.projectId || !FB.apiKey) {
    console.warn('firebase-config.js: no Firebase config, using local storage.');
    return;
  }

  var FS_ROOT = 'https://firestore.googleapis.com/v1/projects/' +
                encodeURIComponent(FB.projectId) +
                '/databases/(default)/documents';
  var KEY = '?key=' + encodeURIComponent(FB.apiKey);

  var listeners = [];

  function withIds(list) {
    return list.map(function (r, i) {
      return Object.assign({}, r, { __backendId: r.id || ('doc-' + i) });
    });
  }

  function broadcast(list) {
    listeners.forEach(function (fn) {
      try { fn(list); } catch (e) { console.warn(e); }
    });
  }

  // Firestore returns typed values like {"stringValue": "Asha"}.
  function docToRow(doc) {
    var f = doc.fields || {};
    return {
      id: (doc.name || '').split('/').pop(),
      name: f.name && f.name.stringValue ? f.name.stringValue : 'Anonymous',
      amount: f.amount ? Number(f.amount.integerValue || f.amount.doubleValue || 0) : 0,
      created_at: f.created_at
        ? (f.created_at.timestampValue || f.created_at.stringValue || null)
        : null
    };
  }

  function fetchRemote() {
    return fetch(FS_ROOT + ':runQuery' + KEY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: COLLECTION }],
          orderBy: [{ field: { fieldPath: 'created_at' }, direction: 'DESCENDING' }],
          limit: 200
        }
      })
    }).then(function (r) {
      if (!r.ok) {
        return r.text().then(function (t) {
          throw new Error('HTTP ' + r.status + ' ' + t.slice(0, 200));
        });
      }
      return r.json();
    }).then(function (rows) {
      return (rows || [])
        .filter(function (x) { return x && x.document; })
        .map(function (x) { return docToRow(x.document); });
    });
  }

  window.dataSdk = {
    // Called once on load with onDataChanged -> renders the wall.
    init: function (opts) {
      var cb = opts && opts.onDataChanged;
      if (typeof cb === 'function') listeners.push(cb);

      // Promise.resolve() first so a synchronous throw (e.g. no fetch in an
      // old browser) becomes a rejection we can catch instead of a crash.
      return Promise.resolve().then(fetchRemote).then(function (rows) {
        if (typeof cb === 'function') cb(withIds(rows || []));
        return { isOk: true };
      }).catch(function (err) {
        console.warn('Firestore read failed:', err);
        return { isOk: false };
      });
    },

    // Adds one supporter row. Email is deliberately never sent.
    create: function (record) {
      return Promise.resolve().then(function () {
        return fetch(FS_ROOT + '/' + COLLECTION + KEY, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fields: {
              name: { stringValue: String(record.name) },
              amount: { integerValue: String(record.amount) },
              created_at: { timestampValue: record.created_at }
            }
          })
        });
      }).then(function (r) {
        if (!r.ok) {
          return r.text().then(function (t) {
            throw new Error('HTTP ' + r.status + ' ' + t.slice(0, 200));
          });
        }
        return fetchRemote().then(function (rows) {
          broadcast(withIds(rows || []));
          return { isOk: true };
        });
      }).catch(function (err) {
        console.warn('Firestore write failed:', err);
        return { isOk: false };
      });
    },

    list: function () {
      return fetchRemote().then(function (rows) { return withIds(rows || []); });
    }
  };
})();

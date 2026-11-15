// ============================================================
//  Buy Me a Coffee — settings
//  This is the only file you need to edit. Change a value,
//  commit on github.com, and the page updates itself in a
//  minute. index.html never needs to be opened again.
// ============================================================
window.BMAC_CONFIG = {

  // ---- Shared supporter wall (Firebase) ----------------------
  // Paste your Firebase web app config here (Firebase console ->
  // Project settings -> Your apps -> Web app -> Config).
  // This block is public by design: it identifies your project,
  // it does not grant access. Security comes from Firestore rules.
  // Leave it empty and the page still works, but each visitor only
  // sees their own browser's list.
  firebase: {
    apiKey: "AIzaSyB9VvCN25LkGM2gePiMPhQ1lCKez_MyPl0",
    authDomain: "buy-me-a-coffee-197b7.firebaseapp.com",
    projectId: "buy-me-a-coffee-197b7",
    storageBucket: "buy-me-a-coffee-197b7.firebasestorage.app",
    messagingSenderId: "573190316198",
    appId: "1:573190316198:web:32f790af128ec66bd51467"
  },
  collection: 'supporters',

  // ---- Payment ------------------------------------------------
  // Your UPI ID. Every QR code and "Open UPI App" button uses this.
  upiId: 'prashantkhati12345@okaxis',

  // ---- Wording ------------------------------------------------
  creatorName: 'Prashant',
  tagline: 'Fueling creativity, one coffee at a time ☕',
  thankYouMessage: 'Thank you for your support, it means a lot! ☕✨',

  // ---- Links --------------------------------------------------
  githubUrl: 'https://github.com/prakha194'

};

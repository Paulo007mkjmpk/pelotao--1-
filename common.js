firebase.initializeApp(firebaseConfig);
const auth = firebase.auth(), db = firebase.firestore();
const $ = s => document.querySelector(s);
const esc = t => String(t ?? "").replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const slug = n => n.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"") || "x";
async function getConfig() {
  const s = await db.doc("config/platoon").get();
  return s.exists ? s.data() : { soldiers: [], squadSize: 5 };
}

let cfg = { soldiers: [], squadSize: 5 }, votes = [], unsub;
$("#entrar").onclick = () => auth.signInWithEmailAndPassword($("#email").value, $("#senha").value)
  .catch(e => $("#lmsg").textContent = "Erro: " + e.message);
$("#sair").onclick = () => auth.signOut();
document.querySelectorAll("[data-tab]").forEach(b => b.onclick = () => {
  $("#painel").classList.toggle("hide", b.dataset.tab !== "painel");
  $("#soldados").classList.toggle("hide", b.dataset.tab !== "soldados");
});
auth.onAuthStateChanged(async u => {
  $("#login").classList.toggle("hide", !!u); $("#app").classList.toggle("hide", !u);
  if (unsub) unsub();
  if (!u) return;
  cfg = await getConfig();
  $("#lista").value = cfg.soldiers.map(s => s.nome).join("\n"); $("#sz").value = cfg.squadSize;
  unsub = db.collection("votes").onSnapshot(q => { votes = q.docs.map(d => d.data()); painel(); },
    e => $("#painel").innerHTML = '<p class="card">Sem permissão para ler os votos: confira o UID do administrador nas regras do Firestore.</p>');
});
$("#salvar").onclick = async () => {
  const seen = {};
  const soldiers = $("#lista").value.split("\n").map(x => x.trim()).filter(Boolean).map(n => {
    let id = slug(n); while (seen[id]) id += "-2"; seen[id] = 1; return { id, nome: n };
  });
  cfg = { soldiers, squadSize: Math.max(1, +$("#sz").value || 5) };
  try { await db.doc("config/platoon").set(cfg); $("#msg").textContent = "✔ Salvo"; painel(); }
  catch (e) { $("#msg").textContent = "Erro: " + e.message; }
};
function stats() {
  return cfg.soldiers.map(s => {
    const ns = [], obs = []; let esc_ = 0;
    votes.forEach(v => {
      const x = (v.scores || {})[s.id];
      if (x && x.nota !== "" && x.nota !== undefined) ns.push(+x.nota);
      if (x && x.obs) obs.push({ cabo: v.cabo, t: x.obs });
      if ((v.squad || []).includes(s.id)) esc_++;
    });
    return { ...s, media: ns.length ? ns.reduce((a, b) => a + b, 0) / ns.length : null, n: ns.length, esc: esc_, obs };
  }).sort((a, b) => b.esc - a.esc || (b.media ?? -1) - (a.media ?? -1));
}
function painel() {
  const st = stats(), nSq = Math.max(1, votes.length), f = m => m === null ? "–" : m.toFixed(1);
  let h = `<div class="card"><b>${votes.length}</b> cabo(s) votaram: <span class="mut">${esc(votes.map(v => v.cabo).join(", ") || "nenhum ainda")}</span></div>
  <h2>Ranking geral</h2><div class="card scroll"><table><tr><th>#</th><th>Soldado</th><th>Nota média</th><th>Escolhas</th></tr>`;
  st.forEach((s, i) => h += `<tr class="${i < cfg.squadSize ? "top" : ""}"><td>${i + 1}</td><td>${esc(s.nome)}</td><td>${f(s.media)} <span class="mut">(${s.n})</span></td><td>${s.esc}</td></tr>`);
  h += `</table></div><h2>Esquadras sugeridas (${nSq})</h2><p class="mut">Os mais escolhidos são distribuídos em sequência alternada entre as esquadras, para equilibrar o nível.</p>`;
  const sq = [...Array(nSq)].map(() => []);
  st.forEach((s, i) => { const r = Math.floor(i / nSq), k = i % nSq; sq[r % 2 ? nSq - 1 - k : k].push(s); });
  sq.forEach((g, i) => h += `<div class="card"><b>Esquadra ${i + 1}</b>${g.map(s => `<div>${esc(s.nome)} <span class="mut">· ${s.esc} escolhas · média ${f(s.media)}</span></div>`).join("")}</div>`);
  h += `<h2>Observações dos cabos</h2>`;
  st.forEach(s => h += `<div class="card"><b>${esc(s.nome)}</b>${s.obs.length ? s.obs.map(o => `<p><span class="mut">${esc(o.cabo)}:</span> ${esc(o.t)}</p>`).join("") : '<p class="mut">Sem observações.</p>'}</div>`);
  $("#painel").innerHTML = h;
}

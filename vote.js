let cfg, mine = { cabo: "", scores: {}, squad: [] }, uid;
async function init() {
  try {
    uid = (await auth.signInAnonymously()).user.uid;
    cfg = await getConfig();
    const m = await db.doc("votes/" + uid).get();
    if (m.exists) mine = Object.assign(mine, m.data());
    render();
  } catch (e) { $("#app").textContent = "Erro ao carregar: " + e.message; }
}
function render() {
  if (!cfg.soldiers.length) { $("#app").innerHTML = '<p class="card">O administrador ainda não cadastrou os soldados.</p>'; return; }
  let h = `<div class="card"><b>Seu nome (cabo)</b><br><input id="cabo" value="${esc(mine.cabo)}" placeholder="Ex.: Cabo Silva"></div>
  <p class="mut">Dê uma nota de 0 a 10 a cada soldado e escreva sua opinião: importância, o que faz de melhor, se é proativo, se levaria para a guerra. Marque até <b>${cfg.squadSize}</b> soldados para a SUA esquadra.</p>`;
  for (const s of cfg.soldiers) {
    const v = mine.scores[s.id] || {};
    h += `<div class="card"><b>${esc(s.nome)}</b><div class="row">
    <label>Nota <select data-nota="${s.id}"><option value="">–</option>${[...Array(11).keys()].map(n => `<option ${v.nota === String(n) ? "selected" : ""}>${n}</option>`).join("")}</select></label>
    <label><input type="checkbox" data-pick="${s.id}" ${mine.squad.includes(s.id) ? "checked" : ""}> Levaria na minha esquadra</label></div>
    <textarea data-obs="${s.id}" placeholder="Importância, ponto forte, proatividade, levaria para a guerra?">${esc(v.obs)}</textarea></div>`;
  }
  $("#app").innerHTML = h + `<button id="enviar">Enviar minha votação</button> <span id="msg" class="mut"></span>`;
  $("#enviar").onclick = save;
  document.querySelectorAll("[data-pick]").forEach(el => el.onchange = () => {
    if (el.checked && document.querySelectorAll("[data-pick]:checked").length > cfg.squadSize) {
      el.checked = false; alert("Limite de " + cfg.squadSize + " soldados na esquadra.");
    }
  });
}
async function save() {
  const cabo = $("#cabo").value.trim();
  if (!cabo) return alert("Informe seu nome.");
  const scores = {};
  cfg.soldiers.forEach(s => scores[s.id] = {
    nota: document.querySelector(`[data-nota="${s.id}"]`).value,
    obs: document.querySelector(`[data-obs="${s.id}"]`).value.trim()
  });
  const squad = [...document.querySelectorAll("[data-pick]:checked")].map(e => e.dataset.pick);
  try {
    await db.doc("votes/" + uid).set({ cabo, scores, squad, at: new Date().toISOString() });
    mine = { cabo, scores, squad };
    $("#msg").textContent = "✔ Votação enviada! Você pode editar e reenviar neste mesmo aparelho."; $("#msg").className = "ok";
  } catch (e) { $("#msg").textContent = "Erro ao salvar: " + e.message; }
}
init();

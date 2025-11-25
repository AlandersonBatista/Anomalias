// Sigma Anomalias PWA - QR externo (ZXing Intent)
let anomalias = [];
const STORAGE_KEY = "sigma_anomalias_pwa_v1";

document.addEventListener("DOMContentLoaded", () => {
  // Carrega banco e data
  carregar();
  preencherData();
  aplicarRetornoQR();

  document.getElementById("formAnomalia").addEventListener("submit", onSalvar);
  document.getElementById("btnLimparForm").addEventListener("click", limparForm);
  document.getElementById("btnLimparHist").addEventListener("click", limparHistorico);
  document.getElementById("btnGerarPdf").addEventListener("click", () => gerarPDF("download"));
  document.getElementById("btnCompartilharPdf").addEventListener("click", () => gerarPDF("share"));

  const btnLerQr = document.getElementById("btnLerQr");
  if(btnLerQr){
    btnLerQr.addEventListener("click", chamarLeitorQRExterno);
  }
});

function showToast(msg){
  const t = document.getElementById("toast");
  if(!t) return;
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2500);
}

function preencherData(){
  const d = new Date();
  const pad = n => String(n).padStart(2,"0");
  const val = d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())
    +"T"+pad(d.getHours())+":"+pad(d.getMinutes());
  const dt = document.getElementById("data");
  if(dt) dt.value = val;
}

function carregar(){
  const raw = localStorage.getItem(STORAGE_KEY);
  if(raw){
    try{ anomalias = JSON.parse(raw) || []; }catch(e){ anomalias = []; }
  }
  renderLista();
}

function salvarStorage(){
  if(anomalias.length > 300){
    anomalias = anomalias.slice(0,300);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(anomalias));
}

function limparForm(){
  document.getElementById("formAnomalia").reset();
  document.getElementById("editId").value = "";
  document.getElementById("btnSalvar").textContent = "SALVAR ANOMALIA";
  preencherData();
}

function onSalvar(e){
  e.preventDefault();

  let amostra = document.getElementById("amostra").value.trim();
  let elemento= document.getElementById("elemento").value.trim();
  let lab     = document.getElementById("lab").value.trim();
  let resp    = document.getElementById("resp").value.trim();
  let grav    = document.getElementById("grav").value.trim();
  let status  = document.getElementById("status").value.trim();
  let data    = document.getElementById("data").value;
  let desc    = document.getElementById("desc").value.trim();

  amostra = amostra.toUpperCase();
  elemento= elemento.toUpperCase();
  lab     = lab.toUpperCase();
  resp    = resp.toUpperCase();
  grav    = grav.toUpperCase();
  status  = status.toUpperCase();
  desc    = desc.toUpperCase();

  const fotoInp = document.getElementById("foto");
  const editId  = document.getElementById("editId").value || null;

  if(!amostra || !desc){
    alert("PREENCHA PELO MENOS FOLIO DA AMOSTRA E DESCRIÇÃO.");
    return;
  }

  const finalizar = (fotoB64) => {
    if(editId){
      const idNum = parseInt(editId,10);
      const idx = anomalias.findIndex(a => a.id === idNum);
      if(idx >= 0){
        anomalias[idx] = {
          id:idNum, amostra, elemento, lab, resp, grav, status, data, desc,
          foto: fotoB64 !== null ? fotoB64 : (anomalias[idx].foto || null)
        };
      }
      showToast("ANOMALIA ATUALIZADA COM SUCESSO.");
    }else{
      const novo = {
        id: Date.now(),
        amostra, elemento, lab, resp, grav, status, data, desc,
        foto: fotoB64
      };
      anomalias.unshift(novo);
      showToast("ANOMALIA REGISTRADA COM SUCESSO.");
    }
    salvarStorage();
    renderLista();
    limparForm();
  };

  if(fotoInp.files && fotoInp.files[0]){
    const file = fotoInp.files[0];
    const reader = new FileReader();
    reader.onload = () => finalizar(reader.result);
    reader.onerror = () => {
      alert("NÃO FOI POSSÍVEL LER A FOTO. SALVANDO SEM IMAGEM.");
      finalizar(null);
    };
    reader.readAsDataURL(file);
  }else{
    finalizar(null);
  }
}

function renderLista(){
  const lista = document.getElementById("lista");
  lista.innerHTML = "";

  if(!anomalias.length){
    const p = document.createElement("p");
    p.className = "empty";
    p.textContent = "NENHUMA ANOMALIA SALVA AINDA.";
    lista.appendChild(p);
    return;
  }

  anomalias.forEach(a => {
    const div = document.createElement("div");
    div.className = "hist-item";

    const top = document.createElement("div");
    top.className = "hist-top";
    const left = document.createElement("div");
    left.textContent = a.amostra;
    const right = document.createElement("div");
    right.className = "badge";
    right.dataset.g = a.grav;
    right.textContent = a.grav + " • " + a.status;
    top.appendChild(left);
    top.appendChild(right);
    div.appendChild(top);

    const meta = document.createElement("div");
    meta.className = "hist-meta";
    meta.textContent =
      (a.elemento || "-") +
      (a.lab ? " • " + a.lab : "") +
      (a.resp ? " • " + a.resp : "") +
      (a.data ? " • " + a.data : "");
    div.appendChild(meta);

    const desc = document.createElement("div");
    desc.className = "hist-desc";
    desc.textContent = a.desc;
    div.appendChild(desc);

    if(a.foto){
      const img = document.createElement("img");
      img.className = "thumb";
      img.src = a.foto;
      div.appendChild(img);
    }

    const actions = document.createElement("div");
    actions.className = "hist-actions";

    const bEdit = document.createElement("button");
    bEdit.className = "btn-mini";
    bEdit.textContent = "EDITAR";
    bEdit.onclick = () => editar(a.id);
    actions.appendChild(bEdit);

    const bDel = document.createElement("button");
    bDel.className = "btn-mini del";
    bDel.textContent = "EXCLUIR";
    bDel.onclick = () => excluir(a.id);
    actions.appendChild(bDel);

    div.appendChild(actions);
    lista.appendChild(div);
  });
}

function editar(id){
  const a = anomalias.find(x => x.id === id);
  if(!a) return;
  document.getElementById("editId").value = a.id;
  document.getElementById("amostra").value = a.amostra || "";
  document.getElementById("elemento").value = a.elemento || "";
  document.getElementById("lab").value = a.lab || "ÁGUAS";
  document.getElementById("resp").value = a.resp || "";
  document.getElementById("grav").value = a.grav || "BAIXA";
  document.getElementById("status").value = a.status || "ABERTA";
  document.getElementById("data").value = a.data || "";
  document.getElementById("desc").value = a.desc || "";
  document.getElementById("btnSalvar").textContent = "ATUALIZAR ANOMALIA";
  window.scrollTo({top:0,behavior:"smooth"});
}

function excluir(id){
  if(!confirm("EXCLUIR ESTA ANOMALIA?")) return;
  anomalias = anomalias.filter(a => a.id !== id);
  salvarStorage();
  renderLista();
  showToast("ANOMALIA EXCLUÍDA.");
}

function limparHistorico(){
  if(!anomalias.length) return;
  if(!confirm("APAGAR TODO O HISTÓRICO DESTE APARELHO?")) return;
  anomalias = [];
  salvarStorage();
  renderLista();
  showToast("HISTÓRICO LIMPO.");
}

// ---------------- QR EXTERNO (ZXing) ------------------
// Usa o app "Barcode Scanner" (com.google.zxing.client.android)
// Intent oficial: intent://scan/?ret=URL%3Fq%3D{CODE}&SCAN_MODE=QR_CODE_MODE#Intent;scheme=zxing;package=com.google.zxing.client.android;end
// Após ler, o app volta para a URL com ?q=... contendo o texto do QR.

function chamarLeitorQRExterno(){
  // URL base da sua aplicação (ajuste se necessário)
  const base = window.location.origin + window.location.pathname;
  const retUrl = encodeURIComponent(base + "?q={CODE}");
  const intentUrl = "intent://scan/?ret=" + retUrl +
    "&SCAN_MODE=QR_CODE_MODE#Intent;scheme=zxing;package=com.google.zxing.client.android;end";

  // Navega para o intent: no Android isso abre o app ZXing se instalado
  window.location.href = intentUrl;
}

// Lê o parâmetro ?q= do retorno e preenche o campo AMOSTRA
function aplicarRetornoQR(){
  const params = new URLSearchParams(window.location.search);
  const q = params.get("q");
  if(q){
    const folio = String(q).trim().toUpperCase();
    const campo = document.getElementById("amostra");
    if(campo){
      campo.value = folio;
      showToast("FOLIO LIDO POR QR EXTERNO.");
    }
    // Limpa o ?q= da URL para não repetir na próxima abertura
    if(window.history && window.history.replaceState){
      const urlSemQ = window.location.origin + window.location.pathname;
      window.history.replaceState({}, "", urlSemQ);
    }
  }
}

// ---------------- PDF ------------------

async function gerarPDF(modo){
  if(!(window.jspdf && window.jspdf.jsPDF)){
    alert("BIBLIOTECA DE PDF NÃO CARREGADA (PRECISA DE INTERNET NA PRIMEIRA VEZ).");
    return;
  }
  if(!anomalias.length){
    alert("NÃO HÁ ANOMALIAS PARA GERAR PDF.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({unit:"pt",format:"a4"});
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 40;

  anomalias.forEach((a, idx) => {
    if(idx > 0) doc.addPage();
    let y = margin;

    doc.setFontSize(14);
    doc.text("RELATÓRIO DE ANOMALIA", margin, y);
    y += 22;

    doc.setFontSize(11);
    doc.text("FOLIO DA AMOSTRA: " + (a.amostra || "-"), margin, y); y += 14;
    doc.text("ELEMENTO / ENSAIO: " + (a.elemento || "-"), margin, y); y += 14;
    doc.text("LABORATÓRIO: " + (a.lab || "-"), margin, y); y += 14;
    doc.text("RESPONSÁVEL: " + (a.resp || "-"), margin, y); y += 14;
    doc.text("GRAVIDADE: " + a.grav + "   STATUS: " + a.status, margin, y); y += 14;
    doc.text("DATA / HORA: " + (a.data || "-"), margin, y); y += 18;

    doc.text("DESCRIÇÃO:", margin, y); y += 14;
    const wrap = doc.splitTextToSize(a.desc || "-", pageW - margin*2);
    wrap.forEach(line => {
      doc.text(line, margin, y);
      y += 12;
      if(y > pageH - margin - 120){
        doc.addPage();
        y = margin;
      }
    });

    if(a.foto){
      try{
        const imgW = 240;
        const imgH = 180;
        const x = (pageW - imgW)/2;
        let imgY = pageH - imgH - margin;
        if(imgY < y + 10) imgY = y + 10;
        doc.addImage(a.foto, "JPEG", x, imgY, imgW, imgH);
      }catch(e){
        console.error("ERRO AO ADICIONAR FOTO NO PDF", e);
      }
    }
  });

  if(modo === "download"){
    doc.save("RELATORIO_ANOMALIAS.pdf");
    return;
  }

  const pdfBlob = doc.output("blob");
  const fileName = "RELATORIO_ANOMALIAS.pdf";
  const pdfFile = new File([pdfBlob], fileName, {type:"application/pdf"});

  if(navigator.share && navigator.canShare && navigator.canShare({files:[pdfFile]})){
    try{
      await navigator.share({
        title:"RELATÓRIO DE ANOMALIAS",
        text:"Segue relatório gerado pelo SIGMA ANOMALIAS.",
        files:[pdfFile]
      });
      return;
    }catch(e){
      console.warn("COMPARTILHAMENTO CANCELADO OU FALHOU:", e);
    }
  }

  const url = URL.createObjectURL(pdfBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  alert("PDF GERADO. ANEXE MANUALMENTE NO WHATSAPP OU E-MAIL.");
}

let anomalias = [];
const STORAGE_KEY = "sigma_anomalias_calc_style_v1";

document.addEventListener("DOMContentLoaded", () => {
  carregar();
  preencherData();

  document.getElementById("formAnomalia").addEventListener("submit", onSalvar);
  document.getElementById("btnLimparForm").addEventListener("click", limparForm);
  document.getElementById("btnLimparHist").addEventListener("click", limparHistorico);
  document.getElementById("btnGerarPdf").addEventListener("click", () => gerarPDF("download"));
  document.getElementById("btnCompartilharPdf").addEventListener("click", () => gerarPDF("share"));
});

function preencherData(){
  const d = new Date();
  const pad = n => String(n).padStart(2,"0");
  const val = d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())
    +"T"+pad(d.getHours())+":"+pad(d.getMinutes());
  document.getElementById("data").value = val;
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
  document.getElementById("btnSalvar").textContent = "Salvar anomalia";
  preencherData();
}

function onSalvar(e){
  e.preventDefault();

  const amostra = document.getElementById("amostra").value.trim();
  const elemento= document.getElementById("elemento").value.trim();
  const lab     = document.getElementById("lab").value.trim();
  const resp    = document.getElementById("resp").value.trim();
  const grav    = document.getElementById("grav").value;
  const status  = document.getElementById("status").value;
  const data    = document.getElementById("data").value;
  const desc    = document.getElementById("desc").value.trim();
  const fotoInp = document.getElementById("foto");
  const editId  = document.getElementById("editId").value || null;

  if(!amostra || !desc){
    alert("Preencha pelo menos Amostra e Descrição.");
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
    }else{
      const novo = {
        id: Date.now(),
        amostra, elemento, lab, resp, grav, status, data, desc,
        foto: fotoB64
      };
      anomalias.unshift(novo);
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
      alert("Não foi possível ler a foto. Salvando sem imagem.");
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
    p.textContent = "Nenhuma anomalia salva ainda.";
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
    bEdit.textContent = "Editar";
    bEdit.onclick = () => editar(a.id);
    actions.appendChild(bEdit);

    const bDel = document.createElement("button");
    bDel.className = "btn-mini del";
    bDel.textContent = "Excluir";
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
  document.getElementById("amostra").value = a.amostra;
  document.getElementById("elemento").value = a.elemento || "";
  document.getElementById("lab").value = a.lab || "";
  document.getElementById("resp").value = a.resp || "";
  document.getElementById("grav").value = a.grav;
  document.getElementById("status").value = a.status;
  document.getElementById("data").value = a.data || "";
  document.getElementById("desc").value = a.desc || "";
  document.getElementById("btnSalvar").textContent = "Atualizar anomalia";
  window.scrollTo({top:0,behavior:"smooth"});
}

function excluir(id){
  if(!confirm("Excluir esta anomalia?")) return;
  anomalias = anomalias.filter(a => a.id !== id);
  salvarStorage();
  renderLista();
}

function limparHistorico(){
  if(!anomalias.length) return;
  if(!confirm("Apagar todo o histórico deste aparelho?")) return;
  anomalias = [];
  salvarStorage();
  renderLista();
}

async function gerarPDF(modo){
  if(!(window.jspdf && window.jspdf.jsPDF)){
    alert("Biblioteca de PDF não carregada (precisa de internet na primeira vez).");
    return;
  }
  if(!anomalias.length){
    alert("Não há anomalias para gerar PDF.");
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
    doc.text("Relatório de Anomalia", margin, y);
    y += 22;

    doc.setFontSize(11);
    doc.text("Amostra/Folio: " + (a.amostra || "-"), margin, y); y += 14;
    doc.text("Elemento/Ensaio: " + (a.elemento || "-"), margin, y); y += 14;
    doc.text("Laboratório: " + (a.lab || "-"), margin, y); y += 14;
    doc.text("Responsável: " + (a.resp || "-"), margin, y); y += 14;
    doc.text("Gravidade: " + a.grav + "   Status: " + a.status, margin, y); y += 14;
    doc.text("Data/Hora: " + (a.data || "-"), margin, y); y += 18;

    doc.text("Descrição:", margin, y); y += 14;
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
        console.error("Erro ao adicionar foto no PDF", e);
      }
    }
  });

  if(modo === "download"){
    doc.save("relatorio_anomalias.pdf");
    return;
  }

  const pdfBlob = doc.output("blob");
  const fileName = "relatorio_anomalias.pdf";
  const pdfFile = new File([pdfBlob], fileName, {type:"application/pdf"});

  if(navigator.share && navigator.canShare && navigator.canShare({files:[pdfFile]})){
    try{
      await navigator.share({
        title:"Relatório de Anomalias",
        text:"Segue relatório gerado pelo Sigma Anomalias.",
        files:[pdfFile]
      });
      return;
    }catch(e){
      console.warn("Compartilhamento cancelado ou falhou:", e);
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
  alert("PDF gerado. Anexe manualmente no WhatsApp ou e-mail.");
}

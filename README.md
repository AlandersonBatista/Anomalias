# 🧪 Sigma Anomalias – PWA para Registro de Desvios em Análises Químicas

O **Sigma Anomalias** é um aplicativo **PWA (Progressive Web App)** desenvolvido para registrar, organizar e exportar anomalias ocorridas durante análises químicas.  
Totalmente inspirado no estilo da sua **Calculadora de Custos**, com tema **dark**, interface moderna e uso simples.

O app funciona **totalmente offline**, armazenando tudo no dispositivo usando `localStorage`.

---

## 🚀 Funcionalidades

### ✔ Registro de anomalias
- Amostra / Folio  
- Elemento ou Ensaio (Mn, CN-WAD, pH etc.)  
- Laboratório (ICP, FRX, Águas, Via Úmida…)  
- Responsável  
- Gravidade (Baixa, Média, Alta, Crítica)  
- Status (Aberta, Em análise, Fechada)  
- Data e hora  
- Descrição detalhada  
- Upload de foto (camera ou galeria)

---

### ✔ Histórico completo
- Lista todas as anomalias salvas
- Armazena até **300 registros**
- Cada card exibe:
  - Amostra
  - Gravidade + Status
  - Metadados (ensaio, lab, responsável, data)
  - Descrição
  - Miniatura da foto
- Opções por item:
  - **Editar**
  - **Excluir**

---

### ✔ Exportação em PDF
- Gera PDF **1 anomalia por página**
- Inclui:
  - texto
  - campos
  - fotos (centralizadas)
- Arquivo: `relatorio_anomalias.pdf`

---

### ✔ Compartilhamento
- Compartilhar PDF via:
  - WhatsApp
  - E-mail
  - Mensagens
  - Drive, OneDrive, etc.
- Se o navegador não suportar `navigator.share`, o PDF faz download automaticamente.

---

### ✔ PWA completo
- Instalável no celular
- Funciona como aplicativo nativo
- Funciona **OFFLINE**
- Cache automático via *service worker*  
- Ícones compatíveis com Android, Windows e iOS

---

## 📁 Estrutura do Projeto


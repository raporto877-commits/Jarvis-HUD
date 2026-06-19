# Workspace Jarvis HUD Performance + Google Sheets

Pacote PWA do Workspace Jarvis HUD com layout futurista, performance otimizada, comandos por voz e estrutura pronta para sincronização com Google Sheets.

## Arquivos

```text
workspace-jarvis-hud-performance-sheets/
  index.html
  manifest.json
  service-worker.js
  google-apps-script.js
  CONFIGURAR-GOOGLE-SHEETS.md
  README.md
  planilha-modelo.csv
  icons/
    icon-72.png
    icon-96.png
    icon-128.png
    icon-144.png
    icon-152.png
    icon-180.png
    icon-192.png
    icon-384.png
    icon-512.png
    icon-maskable-192.png
    icon-maskable-512.png
    favicon.png
    apple-touch-icon.png
```

## Como usar

1. Hospede a pasta em HTTPS ou teste localmente com servidor simples.
2. Abra `index.html`.
3. Para instalar no celular, use **Adicionar à tela inicial** ou **Instalar app**.
4. Para ativar sincronização, siga `CONFIGURAR-GOOGLE-SHEETS.md`.

## Teste local

```bash
cd workspace-jarvis-hud-performance-sheets
python3 -m http.server 8080
```

Depois abra:

```text
http://localhost:8080
```

## Observações

- O app funciona sem Google Sheets usando `localStorage`.
- O Google Sheets serve como nuvem simples entre dispositivos.
- O Briefing continua removido.
- A tecla N continua sem atalho global.
- As tarefas continuam numeradas para comandos por voz.

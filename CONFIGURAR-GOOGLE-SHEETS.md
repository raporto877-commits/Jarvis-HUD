# Configurar Google Sheets no Workspace Jarvis HUD

Este guia conecta o Workspace ao Google Sheets para sincronizar tarefas entre dispositivos.

O app continua funcionando localmente mesmo sem configurar a nuvem. A planilha será apenas o banco de dados simples para sincronização.

---

## O que você vai usar

- `index.html`: app principal.
- `google-apps-script.js`: código que você cola no Google Apps Script.
- `manifest.json` e `service-worker.js`: PWA instalável.
- `planilha-modelo.csv`: exemplo dos campos usados na aba `Tarefas`.

---

## 1. Criar a planilha

1. Acesse Google Sheets.
2. Crie uma nova planilha.
3. Dê um nome, por exemplo: `Workspace Jarvis HUD`.
4. Crie ou renomeie uma aba para exatamente: `Tarefas`.

O script também cria essa aba automaticamente se ela não existir.

---

## 2. Abrir o Apps Script

1. Na planilha, clique em **Extensões**.
2. Clique em **Apps Script**.
3. Apague qualquer código inicial que aparecer.
4. Copie todo o conteúdo do arquivo `google-apps-script.js`.
5. Cole no editor do Apps Script.
6. Salve o projeto com um nome, por exemplo: `Workspace Jarvis API`.

---

## 3. Publicar como Aplicativo da Web

1. No Apps Script, clique em **Implantar**.
2. Clique em **Nova implantação**.
3. Em tipo, escolha **Aplicativo da Web**.
4. Em descrição, escreva algo como: `Workspace Jarvis Sync`.
5. Em **Executar como**, escolha **Eu**.
6. Em **Quem pode acessar**, escolha **Qualquer pessoa** ou **Qualquer pessoa com o link**, conforme disponível na sua conta.
7. Clique em **Implantar**.
8. Autorize as permissões solicitadas pelo Google.
9. Copie a URL gerada do aplicativo da Web.

A URL correta normalmente termina com `/exec`.

Use a URL `/exec`, não a URL `/dev`.

---

## 4. Colar a URL no app

1. Abra o arquivo `index.html` em um editor de texto.
2. Procure por este trecho:

```js
const GOOGLE_SCRIPT_URL = '';
```

3. Cole a URL do Apps Script entre as aspas:

```js
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/SEU_ID_AQUI/exec';
```

4. Salve o arquivo.
5. Publique a pasta em uma hospedagem HTTPS ou teste com servidor local.

---

## 5. Testar sincronização

1. Abra o app.
2. Crie uma tarefa de teste.
3. Clique no botão de nuvem/sincronização.
4. Abra a planilha e veja se a tarefa apareceu na aba `Tarefas`.
5. Abra o app em outro dispositivo usando a mesma hospedagem.
6. Clique em sincronizar e confira se as tarefas carregam.

---

## 6. Como o app se comporta sem nuvem

Se `GOOGLE_SCRIPT_URL` estiver vazio, o app mostra:

> Sincronização em nuvem não configurada. O app continuará salvando localmente.

Nesse modo:

- tarefas continuam salvas no navegador via `localStorage`;
- backup JSON continua funcionando;
- PWA continua funcionando;
- sincronização entre dispositivos fica desativada até configurar o Google Sheets.

---

## 7. Erros comuns

### A URL não termina com `/exec`
Use a URL do Web App publicado, não a URL de teste `/dev`.

### O app não envia dados para a planilha
Confira se o Apps Script foi implantado como **Aplicativo da Web** e se o acesso está liberado para qualquer pessoa com o link.

### Pediu autorização do Google
É normal na primeira implantação. Autorize usando a conta dona da planilha.

### A planilha não atualiza no iPhone
Abra o app hospedado em HTTPS. PWAs no iPhone têm limitações mais rígidas quando abertos localmente.

### Abri por `file://` e não funcionou como PWA
Service worker e PWA precisam de HTTPS ou servidor local. Para teste local, use:

```bash
cd workspace-jarvis-hud-performance-sheets
python3 -m http.server 8080
```

Depois abra:

```text
http://localhost:8080
```

---

## 8. Estrutura da planilha

A aba `Tarefas` usa estes cabeçalhos:

```text
id,nome,descricao,categoria,status,recorrencia,proxima_data,data_criacao,data_atualizacao
```

A coluna `recorrencia` guarda JSON, por exemplo:

```json
{"ativa":true,"tipo":"mensal"}
```

---

## 9. Observação de segurança

Quem tiver a URL pública do Web App pode enviar dados para o endpoint. Para uso pessoal isso costuma ser suficiente, mas não compartilhe a URL publicamente.

Para uma versão mais segura, é possível adicionar um token simples no Apps Script e no app, mas isso exige uma etapa extra de configuração.

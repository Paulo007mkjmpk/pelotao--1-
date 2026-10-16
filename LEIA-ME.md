# Avaliação do Pelotão – como publicar

Dois links, um só projeto:
- **Cabos (votação):** https://SEU-SITE/vote.html
- **Administrador:** https://SEU-SITE/admin.html (exige e-mail e senha)

## 1. Criar o Firebase (grátis)
1. Acesse console.firebase.google.com e crie um projeto.
2. Em **Authentication > Método de login**, ative **Anônimo** e **E-mail/senha**.
3. Em **Authentication > Usuários**, adicione o seu e-mail e senha. Copie o **UID** desse usuário.
4. Em **Firestore Database**, crie o banco (modo produção).
5. Em **Configurações do projeto > Seus apps > Web**, registre um app e copie o config para `firebase-config.js`.

## 2. Regras do Firestore (aba Regras) – troque SEU_UID_ADMIN
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /config/{d} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == "SEU_UID_ADMIN";
    }
    match /votes/{id} {
      allow create, update: if request.auth != null && request.auth.uid == id;
      allow read: if request.auth != null && (request.auth.uid == id || request.auth.uid == "SEU_UID_ADMIN");
    }
  }
}
```

## 3. Publicar
Envie todos os arquivos desta pasta para qualquer hospedagem estática (Firebase Hosting, Netlify, GitHub Pages…).
Em Authentication > Configurações > Domínios autorizados, adicione o domínio do seu site.

## Observações
- Só você lê os votos; os cabos só veem a lista de soldados e o próprio voto.
- Não divulgue o link do admin; mesmo que vaze, sem sua senha ninguém entra.
- O cabo edita o voto pelo mesmo aparelho/navegador (login anônimo). Se trocar de aparelho, será um novo voto.

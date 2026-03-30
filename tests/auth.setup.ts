import { test as setup } from '@playwright/test';
import axios from 'axios';
import path from 'path';

const BASE_URL = "https://api.dev.portalefatturazione.pagopa.it";
const TOKEN = 'eyJraWQiOiJqd3QtZXhjaGFuZ2VfZWE6NDg6NTI6ZTQ6YWU6OGY6MzA6YjU6YWQ6M2M6ZDI6MDU6NzQ6Nzk6Yzk6ZWYiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJmYW1pbHlfbmFtZSI6Ik1hbmNpbmkiLCJmaXNjYWxfbnVtYmVyIjoiTU5DQ1NEMDFSMTNBNzU3RyIsIm5hbWUiOiJDZXNpZGlhIiwic3BpZF9sZXZlbCI6Imh0dHBzOi8vd3d3LnNwaWQuZ292Lml0L1NwaWRMMiIsImZyb21fYWEiOmZhbHNlLCJ1aWQiOiJmMGJjZDQ2OC1kODUzLTRjNjQtYmZiMS0zZTQ3YjUyNDU1ZjEiLCJsZXZlbCI6IkwyIiwiaWF0IjoxNzA2Njk0MTQyLCJleHAiOjE3MDY2OTQxNTcsImF1ZCI6ImRldi5wb3J0YWxlZmF0dHVyYXppb25lLnBhZ29wYS5pdCIsImlzcyI6Imh0dHBzOi8vdWF0LnNlbGZjYXJlLnBhZ29wYS5pdCIsImp0aSI6ImQ4MTk1NjQwLTMwOGEtNDZkOS05MjQ4LTI1YTRjMjYzZWE3OSIsImVtYWlsIjoiYy5tYW5jaW5pQHRlc3QuZW1haWwuaXQiLCJvcmdhbml6YXRpb24iOnsiaWQiOiI3MjkzNTJlOS01YmI5LTRhZmYtYTZiNS1jYTBjODBjMGQzYjQiLCJuYW1lIjoiQ29tdW5lIGRpIFNhbiBNYXVybyBUb3JpbmVzZSIsInJvbGVzIjpbeyJwYXJ0eVJvbGUiOiJNQU5BR0VSIiwicHJvZHVjdElkIjoicHJvZC1wbiIsInJvbGUiOiJhZG1pbiJ9XSwiZmlzY2FsX2NvZGUiOiIwMTExMzE4MDAxMCIsImlwYUNvZGUiOiJjX2kwMzAifSwiZGVzaXJlZF9leHAiOjE3MDY3MjY0ODR9.meZlmu9ERwmXQeT1eS0rfA-Z3qPsc3KsLtInRa9N8VB2mHu6rljKOKEU7jsVYyPkKPG2dl5tSQ5-ScVFJeXxZmiSNyT2tBxTvrl-IT1yYv51YsA7tbyNp0HKQnsCKKIq55BjLd4QZXVgeltoHmoreeCjd7fAiDlLm8inEMJovAMeFei9QI6xMr3icex1CZt_zsegLJUNwGOIhHqs2Q8PUa3I1RP0E9EEnSIkZoirFEfobp501mO956ghduvuDpVwbSN9lTHTtpEk0kjgjFakbs_1NA33iWI5DkNTnfygr9bUBP3cBoXYiBoKNTaygBgUttepali18e_R6tTRKWwuyg'; // <- replace with a valid token

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ page, request }) => {
  
  const selfcareRes = await axios.get(`${BASE_URL}/api/auth/selfcare/login?selfcareToken=${TOKEN}`, {
    headers: { Accept: 'application/json' },
  });

  if (selfcareRes.status !== 200) {
    throw new Error('selfcareLogin failed');
  }

  const jwt = selfcareRes.data[0].jwt;

  // 2️⃣ Call getAuthProfilo API
  const profiloRes = await axios.get(`${BASE_URL}/api/auth/profilo`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
  });

  if (profiloRes.status !== 200) {
    throw new Error('getAuthProfilo failed');
  }

  const storeProfilo = profiloRes.data;

  const newProfilo = {
    auth: storeProfilo.auth,
    nomeEnte: storeProfilo.nomeEnte,
    descrizioneRuolo: storeProfilo.descrizioneRuolo,
    ruolo: storeProfilo.ruolo,
    dataUltimo: storeProfilo.dataUltimo,
    dataPrimo: storeProfilo.dataPrimo,
    prodotto: storeProfilo.prodotto,
    jwt,
    profilo: storeProfilo.profilo,
    nonce: storeProfilo.nonce,
    user: { name: '', ruolo: storeProfilo.descrizioneRuolo, id: '1' },
    idTipoContratto: storeProfilo.idTipoContratto,
    idEnte: storeProfilo.idEnte,
    infoTrimestreComSelected: {},
  };


  await page.goto('http://localhost:3000/auth');
  await page.evaluate(([profile]) => {
    localStorage.setItem('globalStatePF', JSON.stringify({
    "state": {
        "mainState": {
            "mese": "",
            "anno": "",
            "nomeEnteClickOn": "",
            "datiFatturazione": true,
            "primoInserimetoCommessa": false,
            "statusPageDatiFatturazione": "immutable",
            "statusPageInserimentoCommessa": "immutable",
            "datiFatturazioneNotCompleted": false,
            "apiError": null,
            "authenticated": true,
            "badgeContent": 0,
            "messaggioSelected": null,
            "prodotti": [],
            "profilo": profile,
            "docContabileSelected": {
                "key": ""
            },
            "infoTrimestreComSelected": {},
            "contestazioneSelected": {
                "ragioneSociale": "",
                "anno": 0,
                "mese": 0,
                "categoriaDocumento": "",
                "dataInserimento": "",
                "descrizioneStato": "",
                "stato": 0,
                "reportId": 0
            },
            "relSelected": {
                "nomeEnteClickOn": "",
                "mese": 0,
                "anno": 0,
                "idElement": ""
            },
            "inserisciModificaCommessa": "NO_ACTION"
        },
        "statusQueryGetUri": [],
        "appVersion": "0.0.9.1"
    },
    "version": 3
    }));
  }, [newProfilo]);

  // 6️⃣ Save storage state (cookies + localStorage)

  await page.context().storageState({ path: authFile });


 


  //await request.storageState({ path: authFile });
});
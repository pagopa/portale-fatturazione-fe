// Sessione ente fittizia (Comune di San Mauro Torinese) usata da tests/auth.setup.ts.
// Il frontend non decodifica il JWT: con tutte le API mockate token e nonce possono essere fittizi.
export const PROFILO_ENTE = {
  auth: "SELFCARE",
  nomeEnte: "Comune di San Mauro Torinese",
  descrizioneRuolo: "Amministratore",
  ruolo: "R/W",
  dataUltimo: "2026-10-14T09:19:15.93",
  dataPrimo: "2025-11-17T09:25:48.533",
  prodotto: "prod-pn",
  jwt: "fake-jwt-ente",
  profilo: "PA",
  nonce: "fake-nonce-ente",
  user: { name: "", ruolo: "Amministratore", id: "1" },
  idTipoContratto: 1,
  idEnte: "729352e9-5bb9-4aff-a6b5-ca0c80c0d3b4",
  infoTrimestreComSelected: {},
};

export const globalStatePFEnte = (profilo = PROFILO_ENTE) => ({
  state: {
    mainState: {
      mese: "",
      anno: "",
      nomeEnteClickOn: "",
      datiFatturazione: true,
      primoInserimetoCommessa: false,
      statusPageDatiFatturazione: "immutable",
      statusPageInserimentoCommessa: "immutable",
      datiFatturazioneNotCompleted: false,
      apiError: null,
      authenticated: true,
      badgeContent: 0,
      messaggioSelected: null,
      prodotti: [],
      profilo,
      docContabileSelected: { key: "" },
      infoTrimestreComSelected: {},
      contestazioneSelected: {
        ragioneSociale: "", anno: 0, mese: 0, categoriaDocumento: "", dataInserimento: "", descrizioneStato: "", stato: 0, reportId: 0,
      },
      relSelected: { nomeEnteClickOn: "", mese: 0, anno: 0, idElement: "" },
      inserisciModificaCommessa: "NO_ACTION",
    },
    statusQueryGetUri: [],
    appVersion: "0.0.9.1",
  },
  version: 3,
});

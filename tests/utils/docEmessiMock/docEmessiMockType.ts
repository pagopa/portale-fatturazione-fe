export type ResponsePeriodo = {
     anno: number,
     tipologiaFattura: string,
     dataFattura: string,
     mese: number
 }

 // Dati generali di ogni documento
interface DatiGeneraliDocumento {
  tipologia: string;
  riferimentoNumeroLinea: string;
  idDocumento: string;
  data: string;
  numItem: string;
  codiceCommessaConvenzione: string;
  CUP: string;
  CIG: string | null;
}

// Posizioni di ogni fattura
interface Posizione {
  numeroLinea: number;
  testo: string;
  codiceMateriale: string;
  quantita: number;
  prezzoUnitario: number;
  imponibile: number;
  periodoRiferimento: string;
  periodoFatturazione: string;
}

// Fattura principale
interface Fattura {
  totale: number;
  numero: number;
  idfattura: number; // lowercase matches your mock
  dataFattura: string;
  prodotto: string;
  identificativo: string;
  istitutioId: string;
  onboardingTokenID: string;
  ragioneSociale: string;
  idcontratto: string;
  tipoDocumento: string;
  tipocontratto: string;
  divisa: string;
  metodoPagamento: string;
  causale: string;
  split: boolean;
  inviata: number;
  sollecito: any;
  stato: any;
  datiGeneraliDocumento: DatiGeneraliDocumento[];
  posizioni: Posizione[];
}

// Oggetto che avvolge la fattura dentro dettagli
interface Dettaglio {
  fattura: Fattura;
}

// Tipo complessivo del mock
export interface MockListaDoc {
  dettagli: Dettaglio[];
  importo: string;
}
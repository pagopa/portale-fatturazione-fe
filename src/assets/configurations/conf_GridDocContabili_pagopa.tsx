import { HeaderGridCustom } from "../../components/reusableComponents/grid/gridCustom";

export const headersDocContabiliPagopa : HeaderGridCustom[] = [
  { label: "", align: "center", width: "80px", keyValue: "collaps", typeColumn: "collaps" },
  { label: "Nome PSP", align: "center", width: "200px", keyValue: "name", typeColumn: "ragionesociale", makeAction: true, applyCss: true },
  { label: "ID Contratto", align: "center", width: "200px", keyValue: "contractId", typeColumn: "string"},
  { label: "Numero", align: "center", width: "200px", keyValue: "numero", typeColumn: "string"},
  { label: "Trimestre", align: "center", width: "200px", keyValue: "yearQuarter", typeColumn: "string" },
  { label: "Data", align: "center", width: "200px", keyValue: "data", typeColumn: "data" },
  {label:"", align:"center", width:"80px", keyValue:"arrow", typeColumn:"arrow"}
];

export const headersDocContabiliPagopaCollapse: HeaderGridCustom[] = [
  { label: "Codice Articolo", align: "center", width: "100px", keyValue: "codiceArticolo", typeColumn: "number" },
  { label: "ID Categoria", align: "center", width: "100px", keyValue: "category", typeColumn: "string" },
  { label: "Quantità", align: "center", width: "100px", keyValue: "quantita", typeColumn: "number" },
  { label: "Importo", align: "center", width: "100px", keyValue: "importo", typeColumn: "euro-number" },
  { label: "Codice IVA", align: "center", width: "100px", keyValue: "codIva", typeColumn: "string" },
  { label: "Condizioni", align: "center", width: "100px", keyValue: "condizioni", typeColumn: "string" },
  { label: "Causale", align: "center", width: "100px", keyValue: "causale", typeColumn: "string" },
];


export const dettaglioPSP = [
  {key: 'name',description: 'Nome PSP'},
  {key: 'contractId',description: 'ID contratto'},
  {key: 'signedDate',description: 'Data',formatter: (value) => value ? new Date(value).toISOString().split('T')[0] : ''},
  {key: 'contractType',description: 'Tipo contratto'},
  {key: 'abi',description: 'Codice ABI'},
  {key: 'taxCode',description: 'Codice tributario'},
  {key: 'vatCode',description: 'P. IVA'},
  {key: 'membershipId',description: 'Membership ID'},
  {key: 'recipientId',description: 'Recipient ID'},
  {key: 'yearMonth',description: 'Ultimo aggiornamento'}
];

export const dettaglioDocContabile = [
  { key: 'yearQuarter', description: 'Trimestre' },
  { key: 'tipoDoc', description: 'Tipo documento' },
  { key: 'codiceAggiuntivo', description: 'Codice aggiuntivo' },
  { key: 'valuta', description: 'Valuta' },
  { key: 'numero', description: 'Numero' },
  { key: 'data', description: 'Report data', formatter: (value) => value ? new Date(value).toISOString().split('T')[0] : '' },
  { key: 'bollo', description: 'Bollo' },
  { key: 'riferimentoData', description: 'Data di riferimento', formatter: (value) => value && value !== '0001-01-01T00:00:00' ? new Date(value).toISOString().split('T')[0] : '' }
];

import { HeaderGridCustom } from "../../components/reusableComponents/grid/gridCustom";

export const headerGridStoricoDocContabili:HeaderGridCustom[] = [
  { label: "Ragione Sociale", align: "center", width: "200px", keyValue: "ragioneSociale",typeColumn:"ragionesociale",makeAction:false, applyCss:true },
  { label: "Anno", align: "center", width: "100px", keyValue: "annoRiferimento" ,typeColumn:"string" },
  { label: "Mese", align: "center", width: "100px", keyValue: "meseRiferimento" ,typeColumn:"mese-number"},
  { label: "T. Contratto", align: "center", width: "150px", keyValue: "idTipologiaContratto" ,typeColumn:"number-tipocontratto" },
  { label: "Anticipo", align: "center", width: "150px", keyValue: "anticipo" ,typeColumn:"euro" },
  { label: "Anticipo Sospeso", align: "center", width: "150px", keyValue: "anticipoSospeso",typeColumn:"boolean" },
  { label: "Acconto", align: "center", width: "150px", keyValue: "acconto",typeColumn:"euro" },
  { label: "Acconto Sospeso", align: "center", width: "150px", keyValue: "accontoSospeso",typeColumn:"boolean" },
  { label: "Primo Saldo", align: "center", width: "150px", keyValue: "primoSaldo",typeColumn:"euro" },
  { label: "Primo Saldo Sospeso", align: "center", width: "150px", keyValue: "primoSaldoSospeso",typeColumn:"boolean" },
  { label: "Secondo Saldo", align: "center", width: "150px", keyValue: "secondoSaldo",typeColumn:"euro" },
  { label: "Secondo Saldo Sospeso", align: "center", width: "150px", keyValue: "secondoSaldoSospeso" ,typeColumn:"boolean"},
  
];
   
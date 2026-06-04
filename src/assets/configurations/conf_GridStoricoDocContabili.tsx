import { TableCellProps } from "@mui/material";

interface HeaderStoricoDocContabili {
    label:string,
    align:TableCellProps['align'],
    width:number|string,
    keyValue:string,
    headerAction?:boolean| ((row: any) => void),
    chip?:boolean,

}

export const headerGridStoricoDocContabili:HeaderStoricoDocContabili[] = [
  { label: "Ragione Sociale", align: "center", width: "200px", keyValue: "ragioneSociale" },
  { label: "Anno", align: "center", width: "100px", keyValue: "anno" },
  { label: "Mese", align: "center", width: "100px", keyValue: "mese" },
  { label: "T. Contratto", align: "center", width: "150px", keyValue: "tipoContratto" },
  { label: "Anticipo", align: "center", width: "150px", keyValue: "anticipo" },
  { label: "Anticipo Sospeso", align: "center", width: "150px", keyValue: "anticipoSospeso" },
  { label: "Acconto", align: "center", width: "150px", keyValue: "acconto" },
  { label: "Acconto Sospeso", align: "center", width: "150px", keyValue: "accontoSospeso" },
  { label: "Primo Saldo", align: "center", width: "150px", keyValue: "primoSaldo" },
  { label: "Primo Saldo Sospeso", align: "center", width: "150px", keyValue: "primoSaldoSospeso" },
  { label: "Secondo Saldo", align: "center", width: "150px", keyValue: "secondoSaldo" },
  { label: "Secondo Saldo Sospeso", align: "center", width: "150px", keyValue: "secondoSaldoSospeso" },
];
   
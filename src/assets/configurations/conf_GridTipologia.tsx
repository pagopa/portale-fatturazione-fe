import { TableCellProps } from "@mui/material";

export interface TipologiaContrattoConfig {
  label: string;
  align: TableCellProps['align'];
  width: string|number;
  keyValue: string;
}

export const headerNamesTipologia: TipologiaContrattoConfig[] = [
  {label:"Ragione Sociale", align:"center", width:"200px",keyValue:"ragioneSociale"},
  {label:"Data aggiornamento", align:"center", width:"150px",keyValue:"dataInserimento"},
  {label:"Tipologia contatto", align:"center", width:"150px",keyValue:"tipoContratto"}
];
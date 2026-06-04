import { TableCellProps } from "@mui/material";

export interface WhiteListConfig {
  label: string;
  align: TableCellProps['align'];
  width: string | number;
  keyValue: string;
}

export const headerNames: WhiteListConfig[] = [
  { label: '', align: 'center', width: '60px', keyValue: 'checkbox' },
  { label: 'Ragione Sociale', align: 'center', width: '200px', keyValue: 'ragioneSociale' },
  { label: 'Anno', align: 'center', width: '100px', keyValue: 'anno' },
  { label: 'Mese', align: 'center', width: '100px', keyValue: 'mese' },
  { label: 'Tipologia fattura', align: 'center', width: '150px', keyValue: 'tipologiaFatture' },
  { label: 'Tipo contratto', align: 'center', width: '150px', keyValue: 'tipoContratto' },
  { label: '', align: 'center', width: '100px', keyValue: '' }
];



import { TableCellProps } from "@mui/material";
import { HeaderGridCustom } from "../../components/reusableComponents/grid/gridCustom";


export interface TipologiaContrattoConfig {
  label: string;
  align: TableCellProps['align'];
  width: string|number;
  keyValue: string;
  typeColumn:string;
}

export const headerNamesTipologia: HeaderGridCustom[] = [
  {label:"Ragione Sociale", align:"center", width:"200px",keyValue:"ragioneSociale", typeColumn:'ragionesociale',makeAction:false, applyCss:true},
  {label:"Data aggiornamento", align:"center", width:"200px",keyValue:"dataInserimento", typeColumn:'data'},
  {label:"Tipologia contatto", align:"center", width:"200px",keyValue:"tipoContratto", typeColumn:'switch', switchValue:[{keySwitch:2, valueSwitch:"PAC"},{keySwitch:1, valueSwitch:"PAL"}]}
];
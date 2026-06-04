import { IconButton, TableCellProps } from "@mui/material";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { ItemGridPrevisonale } from "../../page/prod_pn/listaModuloComPrevisonale";

interface HeaderPrevisionale {
    label:string,
    align:TableCellProps['align'],
    width:number|string,
    keyValue:string,
    headerAction:boolean| ((row: any) => void),
    chip?:boolean,
    gridAction?:(color:string,disabled:boolean,el:ItemGridPrevisonale) => JSX.Element,
    rowAction?:(el:ItemGridPrevisonale) => void
}

export const headersGridPrevisionale = (fun): HeaderPrevisionale[] => {
  return [
    { label: 'Ragione Sociale',align:'center',width:'200px',keyValue:'ragioneSociale',headerAction:false, rowAction:(el) => fun(el)},
    { label: 'Anno',align:'center',width:'100px',keyValue:'annoValidita',headerAction:false},
    { label: 'Mese',align:'center',width:'100px',keyValue:'meseValidita',headerAction:false},
    { label: 'Stato',align:'center',width:'100px',keyValue:'stato',headerAction:false,chip:true},
    { label: 'Tipo Contratto',align:'center',width:'150px',keyValue:'tipologiaContratto',headerAction:false},
    { label: 'Data Contratto',align:'center',width:'150px',keyValue:'dataContratto',headerAction:false},
    { label: 'Data Inserimento',align:'center',width:'130px',keyValue:'dataInserimento',headerAction:false},
    { label: 'Data Chiusura',align:'center',width:'130px',keyValue:'dataChiusura',headerAction:false},
    { label: 'Tot. Dig. Naz.',align:'center',width:'130px',keyValue:'totaleDigitaleNaz',headerAction:false},
    { label: 'Tot. Dig. Int.',align:'center',width:'130px',keyValue:'totaleDigitaleInternaz',headerAction:false},
    { label: 'Tot. Analog. AR. Naz.',align:'center',width:'130px',keyValue:'totaleAnalogicoARNaz',headerAction:false},
    { label: 'Tot. Analog. AR. Int.',align:'center',width:'130px',keyValue:'totaleAnalogicoARInternaz',headerAction:false},
    { label: 'Tot. Analog. 890 Naz.',align:'center',width:'130px',keyValue:'totaleAnalogico890Naz',headerAction:false},
    { label: 'Tot. Not.',align:'center',width:'130px',keyValue:'totaleNotifiche',headerAction:false},
    { 
      label: '',
      align:'center',
      width:'60px',
      keyValue:'',
      headerAction:false,
      gridAction: ( color, disabled,el) => (
        <IconButton
          size="medium"
          onClick={() => fun(el)}
          disabled={disabled}
        >
          <ArrowForwardIcon sx={{ color }} />
        </IconButton>
      )
    }
  ];
};
   
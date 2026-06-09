import { Chip, IconButton, TableCellProps } from "@mui/material";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';


export interface HeaderGridCustom {
    label:string,
    align:TableCellProps['align'],
    width:number|string,
    headerAction:boolean,
    headerTooltip?: (title: any, label: any, color: any) => JSX.Element,
    gridAction?:(fun:(id) => void,color:string,disabled:boolean,obj:any) => JSX.Element,
    gridOpenDetail?:(disabled:boolean,open?:boolean,setOpen?:(val)=>void) => JSX.Element,
    keyValue:string
}



export const headerNameAsyncDoc: HeaderGridCustom[] = [
  { label: '',align:'center',width:'60px', headerAction:false,gridOpenDetail:(disabled,open,setOpen) =>
    <IconButton
      size="medium"
      onClick={() => setOpen && setOpen(!open)}
      disabled={disabled}
    > {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
    </IconButton>,
  keyValue:'open',
  },
  { label: 'Data Richiesta',align:'center',width:'160px', headerAction:true, keyValue:'dataRichiesta' },
  { label: 'Anno',align:'center',width:'100px',headerAction:false,keyValue:'anno' },
  { label: 'Mese',align:'center',width:'100px',headerAction:false,keyValue:'mese' },
  { label: 'Tot. Not.',align:'center',width:'80px',headerAction:false,keyValue:'totNot' },
  { label: 'Data Esecuzione',align:'center',width:'150px',headerAction:false,keyValue:'dataEsecuzione' },
  { label: 'Stato',align:'center',width:'100px',headerAction:false, headerTooltip:(title,label,color) => <Chip variant="outlined" label={label} sx={{backgroundColor:color}} />,keyValue:'stato' },
  { label: 'Letto',align:'center',width:'30px',headerAction:false,keyValue:'letto' },
  { label: '',align:'center',width:'60',headerAction:false,keyValue:'action',
    gridAction:(fun,color,disabled,obj) =>
      <IconButton
        size="medium"
        onClick={() => fun(obj)}
        disabled={disabled}
      > <FileDownloadIcon sx={{ color: color }}/>
      </IconButton>
  }
];

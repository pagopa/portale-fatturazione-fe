import { Chip, IconButton, Tooltip } from "@mui/material";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';


export interface HeaderGridCustom {
    label:string,
    align:string,
    width:number|string,
    headerAction:boolean,
    headerTooltip?: (title: any, label: any, color: any) => JSX.Element,
    gridAction?:(fun:(id) => void,color:string,disabled:boolean,obj:any) => JSX.Element,
    gridOpenDetail?:(disabled:boolean,open?:boolean,setOpen?:(val)=>void) => JSX.Element,
}



export const headerNameAsyncDoc: HeaderGridCustom[] = [
    { label: '',align:'center',width:'60px', headerAction:false,gridOpenDetail:(disabled,open,setOpen) =>
        <IconButton
            aria-label="Espandi"
            size="medium"
            onClick={() => setOpen && setOpen(!open)}
            disabled={disabled}
        > {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
        </IconButton>
    },
    { label: 'Data Richiesta',align:'center',width:'160px', headerAction:true},
    { label: 'Anno',align:'center',width:'100px',headerAction:false},
    { label: 'Mese',align:'center',width:'100px',headerAction:false},
    { label: 'Tot. Not.',align:'center',width:'80px',headerAction:false},
    { label: 'Data Esecuzione',align:'center',width:'150px',headerAction:false},
    { label: 'Stato',align:'center',width:'100px',headerAction:false, headerTooltip:(title,label,color) => <Chip variant="outlined" label={label} sx={{backgroundColor:color}} /> },
    { label: 'Letto',align:'center',width:'30px',headerAction:false},
    { label: '',align:'center',width:'60',headerAction:false,
        gridAction:(fun,color,disabled,obj) =>
            <IconButton
                aria-label="Scarica"
                size="medium"
                onClick={() => fun(obj)}
                disabled={disabled}
            > <FileDownloadIcon sx={{ color: color }}/>
            </IconButton>
    }
];

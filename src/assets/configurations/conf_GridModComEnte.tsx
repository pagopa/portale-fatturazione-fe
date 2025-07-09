import { Chip, IconButton, Tooltip } from "@mui/material";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';


//ESEMPIO DA SEGUIRE
export interface HeaderGridCustom {
    label:string,
    align:string,
    width:number|string,
    headerAction:boolean,
    headerTooltip?: (title: any, label: any, color: any) => JSX.Element,
    gridAction?:(fun:(id) => void,color:string,disabled:boolean,obj:any) => JSX.Element,
    gridOpenDetail?:(disabled:boolean,open?:boolean,setOpen?:(val)=>void) => JSX.Element,
}



export const headerNameModComTrimestraleENTE: HeaderGridCustom[] = [
    { label: '',align:'center',width:'60px', headerAction:false,gridOpenDetail:(disabled,open,setOpen) =>
        <IconButton
            aria-label="Espandi"
            size="medium"
            onClick={() => setOpen && setOpen(!open)}
            disabled={disabled}
        > {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
        </IconButton>
    },
    { label: 'Anno',align:'center',width:'160px', headerAction:false},
    { label: 'Trimestre',align:'center',width:'160px', headerAction:false},
    { label: 'Stato',align:'center',width:'100px',headerAction:false, headerTooltip:(title,label,color) =>  
        <Tooltip
            placement="bottom"
            title={label}
        ><CheckCircleIcon sx={{ color: color }}/></Tooltip> },
    { label: 'Tot. Notifiche',align:'center',width:'100px',headerAction:false},
    { label: '',align:'center',width:'60',headerAction:false,
        gridAction:(fun,color,disabled,obj) =>
            <IconButton
                size="medium"
                onClick={() => fun(obj)}
                disabled={disabled}
            > <ArrowForwardIcon sx={{ color: color }}/>
            </IconButton>
    }
];


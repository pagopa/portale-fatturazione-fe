import { Chip, IconButton, Tooltip } from "@mui/material";
import FileDownloadIcon from '@mui/icons-material/FileDownload';


export interface HeaderGridCustom {
    label:string,
    align:string,
    width:number|string,
    headerAction:boolean,
    headerTooltip?: (title: any, label: any, color: any) => JSX.Element,
    gridAction?:(fun:(id) => void,color:string,disabled:boolean,obj:any) => JSX.Element
}

export const headerNameAsyncDoc: HeaderGridCustom[] = [
    { label: 'Data Richiesta',align:'center',width:'160px', headerAction:true},
    {label:'Anno',align:'center',width:'100px',headerAction:false},
    { label: 'Mese',align:'center',width:'100px',headerAction:false},
    { label: 'Data Esecuzione',align:'center',width:'150px',headerAction:false},
    { label: 'Stato',align:'center',width:'100px',headerAction:false, headerTooltip:(title,label,color) => <Chip label={label} color={color} /> },
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

import { Chip, Tooltip } from "@mui/material";
import FileDownloadIcon from '@mui/icons-material/FileDownload';


export interface HeaderGridCustom {
    label:string,
    align:string,
    width:number|string,
    headerAction:boolean,
    headerTooltip?: (title: any, label: any, color: any) => JSX.Element,
    gridAction?:(fun) => JSX.Element
}

export const headerNameAsyncDoc: HeaderGridCustom[] = [
    { label: 'Data Richiesta',align:'center',width:'160px', headerAction:true},
    {label:'Anno',align:'center',width:'100px',headerAction:false},
    { label: 'Mese',align:'center',width:'100px',headerAction:false},
    { label: 'Data Esecuzione',align:'center',width:'150px',headerAction:false},
    { label: 'Stato',align:'center',width:'150px',headerAction:false,
        headerTooltip:(title,label,color) =>  
            <Tooltip
                placement="bottom"
                title={title} >
                <Chip label={label} color={color} />
            </Tooltip>},
    { label: 'Letto',align:'center',width:'130px',headerAction:false},
    { label: '',align:'center',width:'50',headerAction:false,
        gridAction:(fun) =>

        }
];

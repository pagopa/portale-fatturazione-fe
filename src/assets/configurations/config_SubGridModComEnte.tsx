import { Chip, IconButton, Tooltip } from "@mui/material";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';


export interface HeaderGridCustom {
    label:string,
    align:"center"|"left"|"right",
    width:number|string,
    headerAction:boolean,
    headerTooltip?: (title: any, label: any, color: any) => JSX.Element,
    headerChip?: (title: any, label: any, color: any) => JSX.Element,
    gridAction?:(fun:(id) => void,color:string,disabled:boolean,obj:any) => JSX.Element,
    gridOpenDetail?:(disabled:boolean,open?:boolean,setOpen?:(val)=>void) => JSX.Element,
}



export const subHeaderNameModComTrimestraleENTE: HeaderGridCustom[] = [
    { label: 'Mese/Anno',align:'center',width:'160px', headerAction:false},
    { label: 'Stato',align:'center',width:'100px',headerAction:false, headerTooltip:(title,label,color) =>  {
        console.log({color});
        return ( <Tooltip
            placement="bottom"
            title={label}
        ><CheckCircleIcon sx={{ color: color }}/></Tooltip> );}},
    { label: 'Inserimento',align:'center',width:'100px',headerAction:false, headerChip:(title,label,color) => <Chip variant="outlined" label={label} sx={{backgroundColor:color}} /> },
    { label: 'Data inserimento',align:'center',width:'160px', headerAction:false},
    { label: 'Data chiusura',align:'center',width:'160px', headerAction:false},
    { label: 'Tot. Digit.',align:'center',width:'160px', headerAction:false},
    { label: 'Tot. Digit. Int.',align:'center',width:'160px', headerAction:false},
    { label: 'Tot. AR.',align:'center',width:'160px', headerAction:false},
    { label: 'Tot. AR. Int.',align:'center',width:'160px', headerAction:false},
    { label: 'Tot. 890.',align:'center',width:'160px', headerAction:false},
    { label: 'Tot. Not.',align:'center',width:'160px', headerAction:false},
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



import { Chip, IconButton, TableCell } from "@mui/material";
import CircleIcon from '@mui/icons-material/Circle';

export const headersName: {label:string,align:string,width:number|string,headerAction:boolean,renderCell?:(param:any,param2:string)=> JSX.Element }[]= [
    {label:'Data Inserimento',align:'left',width:'200px',headerAction:false},
    { label: 'Mese',align:'center',width:'150px',headerAction:false},
    { label: "Anno",align:'center',width:'150px',headerAction:false},
    { label: 'Stato',align:'center',width:'200px',headerAction:false,renderCell: (param:any,param2:string) =>
        <TableCell align='center'>
            <span>
                <Chip sx={{backgroundColor:param2}} label={param} variant="outlined"/>
            </span>
        </TableCell> },
    { label: "Draft",align:'center',width:'150px',headerAction:false, renderCell: (param:any,param2:string) =>
        <TableCell align='center'>
            <IconButton disabled={!param}>
                <CircleIcon sx={{ color: param ? "grey":null, cursor: 'pointer' }}/>
            </IconButton>
           
        </TableCell>},
    { label: '',align:'center',width:'20px',headerAction:false}];

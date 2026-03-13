import { Chip, TableCell } from "@mui/material";

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
    { label: '',align:'center',width:'80px',headerAction:false}];

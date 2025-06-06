import { Chip, TableCell } from "@mui/material";

export const headersName: {label:string,align:string,width:number|string,headerAction:boolean,renderCell?:(param:any,param2:string)=> JSX.Element }[]= [
    { label: 'Ragione Sociale',align:'left',width:'200px', headerAction:false},
    {label:'Data Inserimento',align:'center',width:'200px',headerAction:false},
    { label: 'Mese',align:'center',width:'150px',headerAction:false},
    { label: "Anno",align:'center',width:'150px',headerAction:false},
    { label: 'Stato',align:'center',width:'300px',headerAction:false,renderCell: (param:any,param2:string) =>
        <TableCell align='center'>
            <span>
                <Chip sx={{backgroundColor:param2}} label={param} variant="outlined"/>
            </span>
        </TableCell> },
    { label: 'Categoria Doc.',align:'center',width:'200px',headerAction:false},
    { label: '',align:'center',width:'80px',headerAction:false}];

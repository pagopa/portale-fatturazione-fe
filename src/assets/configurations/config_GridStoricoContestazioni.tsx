import { Chip, TableCell } from "@mui/material";

export const headersName: {
    label:string,
    align:string,
    width:number|string,
    headerAction:boolean,
    renderCell?:(param:any,param2:string)=> JSX.Element,
    keyValue:string
 }[]= [
   { label: 'Ragione Sociale',align:'left',width:'300px', headerAction:false,keyValue:'ragioneSociale'},
   {label:'Data Inserimento',align:'center',width:'200px',headerAction:false,keyValue:'dataInserimento'},
   { label: 'Mese',align:'center',width:'150px',headerAction:false,keyValue:'mese'},
   { label: "Anno",align:'center',width:'150px',headerAction:false,keyValue:'anno'},
   { label: 'Stato',align:'center',width:'300px',headerAction:false,renderCell: (param:any,param2:string) =>
     <TableCell align='center'>
       <span>
         <Chip sx={{backgroundColor:param2}} label={param} variant="outlined"/>
       </span>
     </TableCell>,keyValue:'' },
   { label: 'Categoria Doc.',align:'center',width:'200px',headerAction:false,keyValue:'categoriaDoc'},
   { label: '',align:'center',width:'80px',headerAction:false,keyValue:''}];

import { Chip, TableCell, TableCellProps } from "@mui/material";

export const headersName: {label:string,align:TableCellProps['align'],width:number|string,headerAction:boolean,renderCell?:(param:any,param2:string)=> JSX.Element , keyValue:string}[]= [
  {label:'Data Inserimento',align:'left',width:'250px',headerAction:false,keyValue:'dataInserimento'},
  { label: 'Mese',align:'center',width:'150px',headerAction:false,keyValue:'mese'},
  { label: "Anno",align:'center',width:'150px',headerAction:false,keyValue:'anno'},
  { label: 'Stato',align:'center',width:'200px',headerAction:false,renderCell: (param:any,param2:string) =>
    <TableCell align='center'>
      <span>
        <Chip sx={{backgroundColor:param2}} label={param} variant="outlined"/>
      </span>
    </TableCell>,keyValue:'' },
  { label: '',align:'center',width:'80px',headerAction:false,keyValue:''}];

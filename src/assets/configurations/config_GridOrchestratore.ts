import { TableCellProps } from "@mui/material";

export const headersName: {label:string,align:TableCellProps['align'],width:number|string,headerAction:boolean,keyValue:string}[]= [
    { label: 'Esecuzione',align:'center',width:'160px',headerAction:true,keyValue:'esecuzione'},
    {label:'Anno',align:'center',width:'100px',headerAction:false,keyValue:'anno'},
    { label: 'Mese',align:'center',width:'100px',headerAction:false,keyValue:'mese'},
    { label: 'Tipologia',align:'center',width:'150px',headerAction:false,keyValue:'tipologia'},
    { label: 'Fase',align:'center',width:'150px',headerAction:false,keyValue:'fase'},
    { label: 'Fine Contes.',align:'center',width:'130px',headerAction:false,keyValue:'dataFineContestazioni'},
    { label: 'Fatturazione',align:'center',width:'130px',headerAction:false,keyValue:'dataFatturazione'},
    { label: 'Counter',align:'center',width:'80px',headerAction:false,keyValue:'count'},
    { label: 'Processo',align:'center',width:'100px',headerAction:false,keyValue:''}];
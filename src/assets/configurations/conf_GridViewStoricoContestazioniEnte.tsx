
export const headersNameGridView: {label:string,align:string,width:number|string,headerAction:boolean,renderCell?:(param:any,param2:string)=> JSX.Element,keyObj?:string }[]= [
  { label:'Stato Contestazione',align:'center',width:'200px',headerAction:false,keyObj:"flagContestazione"},
  { label: 'Tipologia Fattura',align:'center',width:'150px',headerAction:false,keyObj:"tipologiaFattura"},
  { label: 'Prod. Postaliz.',align:'center',width:'200px',headerAction:false,keyObj:"totaleNotificheDigitali"},
  { label: 'Tot. Not.',align:'center',width:'200px',headerAction:false,keyObj:"totale"}
];

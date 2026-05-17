
export const headersNameGridView: {label:string,align:string,width:number|string,headerAction:boolean,renderCell?:(param:any,param2:string)=> JSX.Element,keyObj?:string }[]= [
  { label:'Stato Contestazione',align:'center',width:'200px',headerAction:false,keyObj:"flagContestazione"},
  { label: 'Not. Digit.',align:'center',width:'200px',headerAction:false,keyObj:"totaleNotificheDigitali"},
  { label: 'Not. Analog. A/R',align:'center',width:'150px',headerAction:false,keyObj:"totaleNotificheAR"},
  { label: "Not. Analog. L.890/82",align:'center',width:'150px',headerAction:false,keyObj:"totaleNotificheARInt"},
  { label: 'Tot. Not.',align:'center',width:'200px',headerAction:false,keyObj:"totale"}
];

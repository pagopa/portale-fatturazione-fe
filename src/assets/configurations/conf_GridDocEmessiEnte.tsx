
export interface HeaderGridCustom {
    label:string,
    align:string,
    width:number|string,
    headerAction?:boolean,
    headerActionSort?:boolean,
    headerTooltip?: (title: any, label: any, color: any) => JSX.Element,
    gridAction?:(fun:(id) => void,color:string,disabled:boolean,obj:any) => JSX.Element,
    gridOpenDetail?:(disabled:boolean,open?:boolean,setOpen?:(val)=>void) => JSX.Element,
}

export const headersDocumentiEmessiEnte : HeaderGridCustom[] = [
    {label:"",align:"center",width:"30px"},
    {label:"Data Fattura",align:"center",width:"160px",headerActionSort:true},
    {label:"Stato",align:"center",width:"100px"},
    {label:"T. Fattura",align:"center",width:"100px"},
    {label:"Ident.",align:"center",width:"100px",headerActionSort:true},
    {label:"Tipo Contratto",align:"center",width:"100px"},
    {label:"Tot.",align:"center",width:"100px",headerActionSort:true},
    {label:"N. Fattura",align:"center",width:"150px",headerActionSort:true},
    {label:"Tipo Documento",align:"center",width:"150px",headerActionSort:true},
    {label:"Divisa",align:"center",width:"100px"},
    {label:"M. Pagamento",align:"center",width:"100px"},
    {label:"Split",align:"center",width:"100px"},
    {label:"",align:"center",width:"80px"},

];

export const headersDocumentiEmessiEnteCollapse : HeaderGridCustom[] = [
    {label:"Numero Linea",align:"center",width:"100px"},
    {label:"Codice Materiale",align:"center",width:"100px"},
    {label:"Imponibile",align:"center",width:"100px"},
    {label:"Periodo di riferimento",align:"center",width:"100px"},
    {label:"Periodo di fatturazione",align:"center",width:"100px"},
    
];
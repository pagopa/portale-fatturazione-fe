import { GridColDef } from "@mui/x-data-grid";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Tooltip } from "@mui/material";

export  const configListaFatturazione: GridColDef[] = [
    { field: 'ragioneSociale', headerName: 'Ragione Sociale', width: 200 , headerClassName: 'super-app-theme--header', headerAlign: 'left',  renderCell: (param:any) => <Tooltip key={param.row.id} title={param.row.ragioneSociale.length > 20 ? param.row.ragioneSociale : null }><a className="mese_alidita text-primary fw-bolder" href="/">{param.row.ragioneSociale?.toString().length > 20 ? param.row.ragioneSociale?.toString().slice(0, 20) + '...' : param.row.ragioneSociale}</a></Tooltip>},
    { field: 'cup', headerName: 'CUP', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center' },
    { field: 'splitPayment', headerName: 'Split payment', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center' },
    { field: 'idDocumento', headerName: 'ID Documento', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center' },
    { field: 'dataDocumento', headerName: 'Data Documento', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center',valueFormatter: (value:any) =>  ( value.value !== null &&  value.value !== "--") ? new Date(value.value).toLocaleString().split(',')[0] : '--'},
    { field: 'codCommessa', headerName: 'Cod. Commessa', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center' },
    { field: 'dataCreazione', headerName: 'Data Primo Acc.', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center',valueFormatter: (value:{value:string}) => ( value.value !== null &&  value.value !== "--") ? new Date(value.value).toLocaleString().split(',')[0] : '--'},
    { field: 'dataModifica', headerName: 'Data Ultimo Acc.', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center',valueFormatter: (value:{value:string}) =>  ( value.value !== null &&  value.value !== "--") ? new Date(value.value).toLocaleString().split(',')[0] : '--' },
    {field: 'action', headerName: '',sortable: false,width:70,headerAlign: 'center', align: 'center',disableColumnMenu :true,renderCell: (() => ( <ArrowForwardIcon sx={{ color: '#1976D2', cursor: 'pointer' }}/>)),}
];

export  const configListaFatturazioneSever: GridColDef[] = [
    { field: 'ragioneSociale', headerName: 'Ragione Sociale', width: 200 , headerClassName: 'super-app-theme--header', headerAlign: 'left', sortable:false,disableColumnMenu :true, renderCell: (param:any) => <Tooltip key={param.row.id} title={param.row.ragioneSociale.length > 20 ? param.row.ragioneSociale : null }><a className="mese_alidita text-primary fw-bolder" href="/">{param.row.ragioneSociale?.toString().length > 20 ? param.row.ragioneSociale?.toString().slice(0, 20) + '...' : param.row.ragioneSociale}</a></Tooltip>},
    { field: 'tipocontratto', headerName: 'Tipo Contratto', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center',sortable:false,  align: 'center',disableColumnMenu :true ,valueFormatter: (value:any) =>  ( value.value !== null ?  value.value :"--")},
    { field: 'codiceSDI', headerName: 'Codice SDI', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center',sortable:false,  align: 'center',disableColumnMenu :true ,valueFormatter: (value:any) =>  ( value.value !== null ?  value.value :"--")},
    { field: 'cup', headerName: 'CUP', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center',sortable:false,  align: 'center',disableColumnMenu :true },
    { field: 'splitPayment', headerName: 'Split payment', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center',sortable:false, align: 'center',disableColumnMenu :true },
    { field: 'idDocumento', headerName: 'ID Documento', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center',sortable:false, align: 'center',disableColumnMenu :true },
    { field: 'dataDocumento', headerName: 'Data Documento', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center',sortable:false, align: 'center',disableColumnMenu :true,valueFormatter: (value:any) =>  ( value.value !== null &&  value.value !== "--") ? new Date(value.value).toLocaleString().split(',')[0] : '--'},
    { field: 'codCommessa', headerName: 'Cod. Commessa', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center',sortable:false, align: 'center',disableColumnMenu :true, },
    { field: 'dataCreazione', headerName: 'Data Primo Acc.', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center',sortable:false, align: 'center',disableColumnMenu :true,valueFormatter: (value:{value:string}) => ( value.value !== null &&  value.value !== "--") ? new Date(value.value).toLocaleString().split(',')[0] : '--'},
    { field: 'dataModifica', headerName: 'Data Ultimo Acc.', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center',sortable:false, align: 'center',disableColumnMenu :true,valueFormatter: (value:{value:string}) =>  ( value.value !== null &&  value.value !== "--") ? new Date(value.value).toLocaleString().split(',')[0] : '--' },
    {field: 'action', headerName: '',sortable: false,width:70,headerAlign: 'center', align: 'center',disableColumnMenu :true,renderCell: (() => ( <ArrowForwardIcon sx={{ color: '#1976D2', cursor: 'pointer' }}/>)),}
];
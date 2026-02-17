import { GridColDef } from "@mui/x-data-grid";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export const columns: GridColDef[] = [
    { field: 'ragioneSociale', headerName: 'Ragione Sociale', width: 200 , headerClassName: 'super-app-theme--header', headerAlign: 'left',  renderCell: (param:any) => <a className="mese_alidita text-primary fw-bolder" href="/">{param.row.ragioneSociale}</a>},
    { field: 'cup', headerName: 'CUP', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
    { field: 'splitPayment', headerName: 'Split payment', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
    { field: 'idDocumento', headerName: 'ID Documento', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
    { field: 'dataDocumento', headerName: 'Data Documento', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left',valueFormatter: (value:any) =>  value.value !== null ? new Date(value.value).toLocaleString().split(',')[0] : ''},
    { field: 'codCommessa', headerName: 'Cod. Commessa', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
    { field: 'dataCreazione', headerName: 'Data Primo Acc.', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left',valueFormatter: (value:{value:string}) =>  value.value !== null ? new Date(value.value).toLocaleString().split(',')[0] : ''},
    { field: 'dataModifica', headerName: 'Data Ultimo Acc.', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left',valueFormatter: (value:{value:string}) =>  value.value !== null ? new Date(value.value).toLocaleString().split(',')[0] : '' },
    {field: 'action', headerName: '',sortable: false,width:70,headerAlign: 'left',disableColumnMenu :true,renderCell: (() => ( <ArrowForwardIcon sx={{ color: '#1976D2', cursor: 'pointer' }}/>)),}
];
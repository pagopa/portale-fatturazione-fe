import { GridColDef } from "@mui/x-data-grid";
import { GridElementListaCommesse} from "../../types/typeListaModuliCommessa";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { mesiGrid } from "../../reusableFunction/reusableArrayObj";
import { Chip } from "@mui/material";


export const headerNameListaModuliCommessaSEND: GridColDef[] = [
    { field: 'regioneSociale', headerName: 'Ragione Sociale', width: 200 , headerClassName: 'super-app-theme--header', headerAlign: 'center', align:"left",  renderCell: (param:{row:GridElementListaCommesse}) => <a className="mese_alidita text-primary fw-bolder" href="/8">{param.row.ragioneSociale}</a>},
    { field: 'meseValidita', headerName: 'Mese',sortable: false, width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center',align:"center",  renderCell: (param:{row:GridElementListaCommesse}) => <div className="MuiDataGrid-cellContent" title={mesiGrid[param.row.meseValidita]} role="presentation">{mesiGrid[param.row.meseValidita]}</div>},
    { field: 'stato', headerName: 'Stato',sortable: false, width:150,headerAlign: 'center',align:"center",disableColumnMenu :true, renderCell: ((param:{row:GridElementListaCommesse}) =>{
        let statusColor = "#ffffff";
        if(param.row.source === "obbligatorio"){
            statusColor = "#5BB0D5";
        }else if(param.row.source === "archiviato"){
            statusColor =  "#fafafa";
        }else if(param.row.source === "facoltativo"){
            statusColor = "#f7e7bc";
        }
        return <Chip variant="outlined" label={param.row.source.charAt(0).toUpperCase() + param.row.source.slice(1)} sx={{backgroundColor:statusColor}} />;
    })},
    { field: 'dataInserimento', headerName: 'Data inserimento', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align:"center", valueFormatter: ({ value }) => value?.split('T')[0]||"--"},
    { field: 'dataChiusura', headerName: 'Data chiusura', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align:"center", valueFormatter: ({ value }) =>(value?.split('T')[0]|| "--")},
    { field: 'totaleNotificheDigitaleNaz', headerName: 'Tot. Dig. Naz.', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align:"center", valueFormatter: ({ value }) =>(value||"--")},
    { field: 'totaleNotificheDigitaleInternaz', headerName: 'Tot. Dig. Int.', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align:"center", valueFormatter: ({ value }) =>(value||"--")},
    { field: 'totaleNotificheAnalogicoARInternaz', headerName: 'Tot. Analog. AR. Int.', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align:"center",valueFormatter: ({ value }) =>(value||"--")},
    { field: 'totaleNotificheAnalogico890Naz', headerName: 'Tot. Analog. 890 Naz.', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align:"center",valueFormatter: ({ value }) =>(value||"--")},
    { field: 'totaleNotifiche', headerName: 'Tot. Not.', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align:"center",valueFormatter: ({ value }) =>(value||"--")},
    { field: 'action', headerName: '',sortable: false, width:70,headerAlign: 'center',align:"center",disableColumnMenu :true, renderCell: (() => (<ArrowForwardIcon sx={{ color: '#1976D2', cursor: 'pointer' }} /> ) ),}
];



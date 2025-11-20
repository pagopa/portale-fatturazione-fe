import { GridColDef } from "@mui/x-data-grid";
import { GridElementListaCommesse} from "../../types/typeListaModuliCommessa";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { mesiGrid } from "../../reusableFunction/reusableArrayObj";
import { Chip, Tooltip } from "@mui/material";


export const headerNameListaModuliCommessaSEND: GridColDef[] = [
    { field: 'regioneSociale', headerName: 'Ragione Sociale', width: 200 , headerClassName: 'super-app-theme--header', headerAlign: 'left', align:"left", renderCell: (param:any) => <Tooltip key={param.row.idEnte} title={param.row.ragioneSociale.length > 20 ? param.row.ragioneSociale : null }><a className="mese_alidita text-primary fw-bolder" href="/">{param.row.ragioneSociale?.toString().length > 20 ? param.row.ragioneSociale?.toString().slice(0, 20) + '...' : param.row.ragioneSociale}</a></Tooltip>},
    { field: 'tipologiaContratto', headerName: 'Tipo Contratto',sortable: false, width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center',align:"center",  valueFormatter: ({ value }) =>(value !== null ? value :"--")},
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
    { field: 'dataInserimento', headerName: 'Data Inserimento', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align:"center", valueFormatter: ({ value }) => value?.split('T')[0]||"--"},
    { field: 'dataChiusura', headerName: 'Data Chiusura', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align:"center", valueFormatter: ({ value }) =>(value?.split('T')[0]|| "--")},
    { field: 'totaleNotificheDigitaleNaz', headerName: 'Tot. Dig. Naz.', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align:"center", valueFormatter: ({ value }) =>(value !== null ? value :"--")},
    { field: 'totaleNotificheDigitaleInternaz', headerName: 'Tot. Dig. Int.', width: 200, headerClassName: 'super-app-theme--header', headerAlign: 'center', align:"center", valueFormatter: ({ value }) =>(value !== null ? value :"--")},
    { field: 'totaleNotificheAnalogicoARNaz', headerName: 'Tot. Analog. AR. Naz.', width: 200, headerClassName: 'super-app-theme--header', headerAlign: 'center', align:"center",valueFormatter: ({ value }) =>(value !== null ? value :"--")},
    { field: 'totaleNotificheAnalogicoARInternaz', headerName: 'Tot. Analog. AR. Int.', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align:"center",valueFormatter: ({ value }) =>(value !== null ? value :"--")},
    { field: 'totaleNotificheAnalogico890Naz', headerName: 'Tot. Analog. 890 Naz.', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align:"center",valueFormatter: ({ value }) =>(value !== null ? value :"--")},
    { field: 'totaleNotifiche', headerName: 'Tot. Not.', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align:"center",valueFormatter: ({ value }) =>(value !== null ? value :"--")},
    { field: 'action', headerName: '',sortable: false, width:70,headerAlign: 'center',align:"center",disableColumnMenu :true, renderCell: (() => (<ArrowForwardIcon sx={{ color: '#1976D2', cursor: 'pointer' }} /> ) ),}
];



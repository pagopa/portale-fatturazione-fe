import { GridColDef } from "@mui/x-data-grid";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { GridElementListaCommesse } from "../../types/typeListaModuliCommessa";
import { mesiGrid } from "../../reusableFunction/reusableArrayObj";


export const columns: GridColDef[] = [
    { field: 'regioneSociale', headerName: 'Ragione Sociale', width: 200 , headerClassName: 'super-app-theme--header', headerAlign: 'left',  renderCell: (param:{row:GridElementListaCommesse}) => <a className="mese_alidita text-primary fw-bolder" href="/8">{param.row.ragioneSociale}</a>},
    { field: 'mese', headerName: 'Mese', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left',  renderCell: (param:{row:GridElementListaCommesse}) => <div className="MuiDataGrid-cellContent" title={mesiGrid[param.row.mese]} role="presentation">{mesiGrid[param.row.mese]}</div>},
    { field: 'prodotto', headerName: 'Prodotto', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
    { field: 'numeroNotificheNazionaliDigitale', headerName: 'Num. Not. Naz.', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
    { field: 'tipoSpedizioneAnalogicoAR', headerName: 'Tipo spediz. Analog.', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
    { field: 'numeroNotificheInternazionaliDigitale', headerName: 'Num. Not. Int.', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
    { field: 'numeroNotificheNazionaliAnalogicoAR', headerName: 'Num. Not. Naz. AR', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
    { field: 'numeroNotificheInternazionaliAnalogicoAR', headerName: 'Num. Not. Int. AR', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
    { field: 'numeroNotificheNazionaliAnalogico890', headerName: 'Num. Not. Naz. 890', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
    { field: 'numeroNotificheInternazionaliAnalogico890', headerName: 'Num. Not. Naz. AR 890', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
    { field: 'totaleAnalogicoLordo', headerName: 'Tot. Spedizioni A.', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left',  valueFormatter: ({ value }) => value.toLocaleString("de-DE", { style: "currency", currency: "EUR" })},
    { field: 'totaleDigitaleLordo', headerName: 'Tot. Spedizioni D', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left', valueFormatter: ({ value }) => value.toLocaleString("de-DE", { style: "currency", currency: "EUR" }) },
    {field: 'action', headerName: '',sortable: false, width:70,headerAlign: 'left',disableColumnMenu :true, renderCell: (() => (<ArrowForwardIcon sx={{ color: '#1976D2', cursor: 'pointer' }} onClick={() => console.log('Show page details')} /> ) ),}
];
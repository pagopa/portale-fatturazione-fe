import { Chip, TableCell } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import { mesiGrid } from "../../reusableFunction/reusableArrayObj";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export const configGridJsonSap = (statoFattura)  => {

    const columns : GridColDef[] = [
        { field: 'tipologiaFattura', headerName: 'Tipologia Fattura', width: 200 , headerClassName: 'super-app-theme--header', headerAlign: 'center',align:"center",  renderCell: (param:any) => <a className="mese_alidita text-primary fw-bolder" href="/">{param.row.tipologiaFattura}</a>},
        { field: 'statoInvio', headerName: 'Stato', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align:"center",renderCell: (param:any) =>
            <TableCell align='center'>
                <span>
                    <Chip label={statoFattura(param.row).label} color={statoFattura(param.row).color} />
                </span>
            </TableCell> },
        { field: 'numeroFatture', headerName: 'Numero', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center',align:"center" },
        { field: 'annoRiferimento', headerName: 'Anno', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center',align:"center"  },
        { field: 'meseRiferimento', headerName: 'Mese', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center',align:"center",  renderCell: (param:{row:any}) => <div className="MuiDataGrid-cellContent" title={mesiGrid[param.row.meseRiferimento]} role="presentation">{mesiGrid[param.row.meseRiferimento]}</div>},
        { field: 'importo', headerName: 'Importo', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center',align:"right" },
        {field: 'action', headerName: '',sortable: false,width:100,align:"center",disableColumnMenu :true,renderCell: (() => ( <ArrowForwardIcon sx={{ color: '#1976D2', cursor: 'pointer' }}/>)),}
    ];
    return columns; 
};
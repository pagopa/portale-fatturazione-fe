import { GridColDef } from "@mui/x-data-grid";
import { Accertamento } from "../../types/typeAccertamenti";
import DownloadIcon from '@mui/icons-material/Download';
import { mesiGrid } from "../../reusableFunction/reusableArrayObj";

export const headerColumsDocContabili = (downloadFun: (id: any) => void): GridColDef[] => {
    return [
        { 
            field: 'descrizione',
            headerName: 'Tipologia Accertamento',
            width: 400,
            headerClassName: 'super-app-theme--header',
            headerAlign: 'left',
            align: "left",
            renderCell: (param: { row: Accertamento }) =>
                <a className="mese_alidita text-primary fw-bolder" href="/">
                    {param.row.descrizione}
                </a>
        },
        {
            field: 'prodotto',
            headerName: 'Prodotto',
            width: 150,
            headerClassName: 'super-app-theme--header',
            headerAlign: 'center',
            align: "center",
            valueGetter: (params) =>
                (params.value === null || params.value === "") ? "--" : params.value
        },
        {
            field: 'anno',
            headerName: 'Anno',
            width: 150,
            headerClassName: 'super-app-theme--header',
            headerAlign: 'center',
            align: "center",
            valueGetter: (params) =>
                (params.value === null || params.value === "") ? "--" : params.value
        },
        {
            field: 'mese',
            headerName: 'Mese',
            width: 150,
            headerClassName: 'super-app-theme--header',
            headerAlign: 'center',
            align: "center",
            renderCell: (param: { row: Accertamento }) =>
                <div className="MuiDataGrid-cellContent" title={mesiGrid[param.row.mese]}>
                    {mesiGrid[param.row.mese]}
                </div>
        },
        {
            field: 'contentType',
            headerName: 'Tipo File',
            width: 150,
            headerClassName: 'super-app-theme--header',
            headerAlign: 'center',
            align: "center",
            renderCell: (param: { row: Accertamento }) => {
                if (param.row.contentType === "text/csv") {
                    return <div title="CSV">CSV</div>;
                }
                if (param.row.contentType === "application/zip") {
                    return <div title="Zip">ZIP</div>;
                }
                if (param.row.contentType === "application/vnd.ms-excel") {
                    return <div title="Excel">EXCEL</div>;
                }
                return null;
            },
            valueGetter: (params) =>
                (params.value === null || params.value === "") ? "--" : params.value
        },
        {
            field: 'action',
            headerName: '',
            sortable: false,
            width: 70,
            headerAlign: 'center',
            align: "center",
            disableColumnMenu: true,
            renderCell: (param: { id: any; row: Accertamento }) =>
                <DownloadIcon
                    sx={{ marginLeft: '10px', color: '#1976D2', cursor: 'pointer' }}
                    onClick={() => downloadFun(param.id)}
                />
        }
    ];
};


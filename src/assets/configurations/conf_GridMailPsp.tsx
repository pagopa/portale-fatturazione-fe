import { Chip, Tooltip } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";

export const headerMailPsp: GridColDef[] = [

    {
        field: 'ragioneSociale',
        headerName: 'Ragione Sociale',
        width: 220,
        headerClassName: 'super-app-theme--header',
        headerAlign: 'left',
        sortable: false,
        filterable: false,
        align: 'left',
        renderCell: (param: any) => (
            <Tooltip
                title={param.row.ragioneSociale?.length > 20 ? param.row.ragioneSociale : null}
            >
                <span className="text-primary fw-bolder">
                    {param.row.ragioneSociale?.length > 20
                        ? param.row.ragioneSociale.slice(0, 20) + '...'
                        : param.row.ragioneSociale}
                </span>
            </Tooltip>
        ),
    },

    {
        field: 'anno',
        headerName: 'Anno',
        width: 100,
        headerClassName: 'super-app-theme--header',
        headerAlign: 'center',
        align: 'center',
        sortable: false,
        filterable: false,
    },
    {
        field: 'trimestre',
        headerName: 'Trimestre',
        width: 120,
        headerClassName: 'super-app-theme--header',
        headerAlign: 'center',
        align: 'center',
        sortable: false,
        filterable: false,
    },
    {
        field: 'tipologia',
        headerName: 'Tipologia',
        width: 150,
        headerClassName: 'super-app-theme--header',
        headerAlign: 'center',
        align: 'center',
        sortable: false,
        filterable: false,
        renderCell: (param: any) => (
            <Chip
                variant="outlined"
                label={param.value}
                sx={{ fontWeight: 600 }}
            />
        ),
    },
    {
        field: 'psp',
        headerName: 'PSP',
        width: 160,
        headerClassName: 'super-app-theme--header',
        headerAlign: 'center',
        align: 'center',
        sortable: false,
        filterable: false,
    },
    {
        field: 'email',
        headerName: 'Email',
        width: 220,
        headerClassName: 'super-app-theme--header',
        headerAlign: 'left',
        align: 'left',
        sortable: false,
        filterable: false,
    },
    {
        field: 'dataEvento',
        headerName: 'Data Evento',
        width: 150,
        headerClassName: 'super-app-theme--header',
        headerAlign: 'center',
        align: 'center',
        sortable: false,
        filterable: false,
        valueFormatter: ({ value }) => value?.split('T')[0] || '--',
    },
    {
        field: 'invio',
        headerName: 'Invio',
        width: 120,
        headerClassName: 'super-app-theme--header',
        headerAlign: 'center',
        align: 'center',
        sortable: false,
        filterable: false,
        renderCell: (param: any) => (
            <Chip
                label={param.value ? 'Inviato' : 'Non inviato'}
                color={param.value ? 'success' : 'default'}
                variant="filled"
            />
        ),
    },
    {
        field: 'messaggio',
        headerName: 'ID Messaggio',
        width: 200,
        headerClassName: 'super-app-theme--header',
        headerAlign: 'center',
        align: 'center',
        sortable: false,
        filterable: false,
        valueFormatter: ({ value }) => value ? value.slice(0, 10) + '...' : '--',
    },
];
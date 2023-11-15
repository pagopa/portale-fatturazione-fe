import React from 'react';
import { Box } from '@mui/material';
import { DataGrid,  GridColDef } from '@mui/x-data-grid';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';


type GridData = {
    id: number,
    Mese: string,
    Lavorazione: string,
    Stato: string,
    'Not. Digitali': number,
    'Not. Analog. AR. Naz.': number,
    'Not. Analog. AR. No Naz.': number,
    'Not. Analog. 890/1982': number,
    'Tot. Mod. Commessa': string,
  
}
interface GridComponentProps {
    data: GridData[],
   
}

const GridComponent : React.FC<GridComponentProps> = (props) => {

    const {data } = props;
    const makeColums = Object.keys(data[0]).map((singleKey) => {
        if (singleKey === 'Mese') {
            return {
                field: singleKey,
                headerClassName: 'super-app-theme--header',
                headerAlign: 'left',
                width: 160,
                renderCell: (param:any) => <a className="primary" href="/">{param.row.Mese}</a>
                ,

            };
        }
        return {
            field: singleKey,
            headerClassName: 'super-app-theme--header',
            headerAlign: 'left',
            width: 160,

        };
    });

    const showDetailsButton = {
        field: 'action',
        headerName: '',
        sortable: false,
        headerAlign: 'left',
        renderCell: ((row : any) => (

            <ArrowForwardIcon sx={{ color: '#1976D2', cursor: 'pointer' }} onClick={() => console.log('Show page details', row)} />

        )
        ),
    };

    const columsWithButton : any[] = [...makeColums, showDetailsButton];

    return (

        <Box sx={{ width: '100%' }}>
            <DataGrid
                sx={{
                    '&.MuiDataGrid-root': {
                        borderStyle: 'none',
                    },
                    '& .MuiDataGrid-columnSeparator': {
                        display: 'none',
                    },
                    '& .MuiDataGrid-virtualScroller': {
                        backgroundColor: 'white',
                    },
                    '& .MuiDataGrid-footerContainer':{
                        display: 'none'
                    }
                }}
                rows={data}
                columns={columsWithButton}
                columnVisibilityModel={{
                    id: false,
                    DataPrimoAccesso: false,
                    DataUltimoAccesso: false,
                }}
                autoHeight
                disableColumnMenu
       
            />
        </Box>
    );
};
export default  GridComponent;

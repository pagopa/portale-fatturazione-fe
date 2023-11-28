import React from 'react';
import { Box } from '@mui/material';
import { DataGrid,  GridColDef } from '@mui/x-data-grid';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';



interface GridComponentProps {
    data: any[],
   
}

const GridComponent : React.FC<GridComponentProps> = (props) => {

    const {data } = props;
    console.log(data);
    let makeColums : any[] = [];
  
    if(data.length > 0){
        makeColums = Object.keys(data[0]).map((singleKey) => {
            console.log(singleKey);
            if (singleKey === 'meseValidita') {
                return {
                    field: singleKey,
                    headerClassName: 'super-app-theme--header',
                    headerAlign: 'left',
                    width: 160,
                    renderCell: (param:any) => <a className="primary" href="/">{param.row.meseValidita}</a>
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
    }
  

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

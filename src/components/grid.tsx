import React from 'react';
import { Box } from '@mui/material';
import { DataGrid, GridRowParams,GridEventListener,MuiEvent } from '@mui/x-data-grid';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router';



interface GridComponentProps {
    data: any[],
    setMeseAnnoModuloCommessa:any
   
}

const GridComponent : React.FC<GridComponentProps> = (props) => {
    const {data, setMeseAnnoModuloCommessa} = props;
    const navigate = useNavigate();

    let columsSelectedGrid = '';
    const handleOnCellClick = (params:any) =>{
        columsSelectedGrid  = params.field;
        
    };



    const handleEvent: GridEventListener<'rowClick'> = (
        params:GridRowParams,
        event: MuiEvent<React.MouseEvent<HTMLElement>>,
    ) => {
        event.preventDefault();
        if(columsSelectedGrid  === 'meseValidita' ||columsSelectedGrid  === 'action' ){
            setMeseAnnoModuloCommessa({
                mese:params.row.meseValidita,
                anno:params.row.annoValidita,
                modifica:params.row.modifica,
                userClickOn:'GRID'
            });
            navigate('/8');
        }
       
    };

    
   
   
  
    let makeColums : any[] = [];
  
    if(data.length > 0){
        makeColums = Object.keys(data[0]).map((singleKey) => {
          
            if (singleKey === 'meseValidita') {
                return {
                    field: singleKey,
                    headerClassName: 'super-app-theme--header',
                    headerAlign: 'left',
                    width: 160,
                    renderCell: (param:any) => <a className="mese_alidita text-primary fw-bolder" href="/">{param.row.meseValidita}</a>
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

            <ArrowForwardIcon sx={{ color: '#1976D2', cursor: 'pointer' }} onClick={() => console.log('Show page details')} />

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
                onRowClick={handleEvent}
                onCellClick={handleOnCellClick}
                rows={data}
                columns={columsWithButton}
                columnVisibilityModel={{
                    id: false,
                    modifica:false
                }}
                autoHeight
                disableColumnMenu
            />
        </Box>
    );
};
export default  GridComponent;

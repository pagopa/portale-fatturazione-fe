import React from 'react';
import { Box } from '@mui/material';
import { DataGrid, GridRowParams,GridEventListener,MuiEvent, GridColDef } from '@mui/x-data-grid';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router';
import { DataGridCommessa } from '../../types/typeModuloCommessaElenco';
import { MainState, Params } from '../../types/typesGeneral';



interface GridComponentProps {
    data: DataGridCommessa[],
    setMainState:any,
    mainState:MainState
   
}

const GridComponent : React.FC<GridComponentProps> = (props) => {
    const {data, setMainState} = props;
    const month = ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre",'Gennaio'];

  
    const dataWithLabelFixed = data.map((singleObj)=>{
        const mese = month[singleObj.meseValidita -1 ];
        const newObj = {
            meseValidita: mese,
        };
      
       

        return {...singleObj, ...newObj};
       
    });


    const navigate = useNavigate();

   

    let columsSelectedGrid = '';
    const handleOnCellClick = (params:Params) =>{
        console.log(params, 'params');
        columsSelectedGrid  = params.field;
        
    };



    const handleEvent: GridEventListener<'rowClick'> = (
        params:GridRowParams,
        event: MuiEvent<React.MouseEvent<HTMLElement>>
    ) => {
        event.preventDefault();
        // l'evento verrà eseguito solo se l'utente farà il clik sul mese o l'action(freccia)
        if(columsSelectedGrid  === 'meseValidita' ||columsSelectedGrid  === 'action' ){

            const getMeseIndex :number = month.findIndex(x => x == params.row.meseValidita); 
          
            const newState = {
                path:'/8',
                mese:getMeseIndex+1,
                anno:params.row.annoValidita,
                userClickOn:'GRID',
                inserisciModificaCommessa:"MODIFY"
            };
            const string = JSON.stringify(newState);
            localStorage.setItem('statusApplication', string);

            setMainState((prev:MainState)=>({...prev, ...{
                mese:getMeseIndex+1,
                anno:params.row.annoValidita,
                modifica:params.row.modifica,
                userClickOn:'GRID',
                inserisciModificaCommessa:"MODIFY"
            }}));
            // localStorage.removeItem('statusApplication');
           
            navigate('/8');
        }
       
    };

    
    const columns: GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 90 },
        {
            field: 'meseValidita',
            headerClassName: 'super-app-theme--header',
            headerAlign: 'left',
            headerName:'Mese',
            width: 120,
            renderCell: (param:Params) => <a className="mese_alidita text-primary fw-bolder" href="/">{param.row.meseValidita}</a>
            

        },
        {
            field: 'stato',
            headerClassName: 'super-app-theme--header',
            headerAlign: 'left',
            headerName:'Stato',
            width: 160,

        },
        {
            field: 'dataModifica',
            headerClassName: 'super-app-theme--header',
            headerAlign: 'left',
            headerName:'Data Inserimento',
            width: 190,

        },
        {
            field: 'totale',
            headerClassName: 'super-app-theme--header',
            headerAlign: 'left',
            headerName:'Totale',
            width: 160,

        },
        {
            field: 'totaleDigitale',
            headerClassName: 'super-app-theme--header',
            headerAlign: 'left',
            headerName:'Tot. Digitale',
            width: 160,

        },
        {
            field:'totaleAnalogico',
            headerClassName: 'super-app-theme--header',
            headerAlign: 'left',
            headerName:'Tot. Analogiche',
            width: 160,

        },
        {
            field: 'action',
            headerName: '',
            sortable: false,
            headerAlign: 'left',
            renderCell: (() => (
    
                <ArrowForwardIcon sx={{ color: '#1976D2', cursor: 'pointer' }} />
    
            )
            ),
        }
    ];
  
   
   

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
                rows={dataWithLabelFixed}
                columns={columns}
                columnVisibilityModel={{
                    id: false,
                    modifica:false,
                    idEnte:false,
                    idTipoContratto:false,
                    annoValidita:false,
                    prodotto:false,
                }}
                autoHeight
                disableColumnMenu
            />
        </Box>
    );
};
export default  GridComponent;

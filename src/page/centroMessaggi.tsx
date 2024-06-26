import { Button, Typography } from "@mui/material";
import DownloadIcon from '@mui/icons-material/Download';
import { DataGrid, GridRowParams,GridEventListener,MuiEvent, GridColDef } from '@mui/x-data-grid';
import { useState } from "react";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SelectUltimiDueAnni from "../components/reusableComponents/select/selectUltimiDueAnni";
import SelectMese from "../components/reusableComponents/select/selectMese";



const CentroMessaggi : React.FC = () => {

    const currentYear = (new Date()).getFullYear();
    const currentMonth = (new Date()).getMonth() + 1;
    const monthNumber = Number(currentMonth);

    const [bodyCentroMessaggi, setBodyCentroMessaggi] = useState({
        anno:currentYear,
        mese:null
    });

    const [gridData, setGridData] = useState([{
        anno:2023,
        mese:'Gennaio',
        stato:'presa in carico',
        dataI:'23/06/2024',
        dataF:'24/06/2024',
        id:1,
    }]);

    const [infoPageListaDatiFat , setInfoPageListaDatiFat] = useState({ page: 0, pageSize: 100 });

    let columsSelectedGrid = '';
    const handleOnCellClick = (params) =>{
        columsSelectedGrid  = params.field;
    };

    const handleEvent: GridEventListener<'rowClick'> = (
        params:GridRowParams,
        event: MuiEvent<React.MouseEvent<HTMLElement>>,
    ) => {
        event.preventDefault();
        console.log(event);
    };

    const columns: GridColDef[] = [
        { field: 'anno', headerName: 'Anno Riferimento', width: 200 , headerClassName: 'super-app-theme--header', headerAlign: 'left'},
        { field: 'mese', headerName: 'Mese Riferimento', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'stato', headerName: 'Stato', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'dataI', headerName: 'Data di riferimento', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'dataF', headerName: 'Data Step corrente', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left'},
        {field: 'action', headerName: '',sortable: false,width:70,headerAlign: 'left',disableColumnMenu :true,renderCell: (() => ( <ArrowForwardIcon sx={{ color: '#1976D2', cursor: 'pointer' }} onClick={() => console.log('Show page details')} />)),}
    ];

  

    return (
        <div className="mx-5">
            <div className="marginTop24 ">
                <Typography variant="h4">Centro Messaggi</Typography>
            </div>
            <div className="mt-5">
                <div className="row">
                    <div className="col-3">
                        <SelectUltimiDueAnni values={bodyCentroMessaggi} setValue={setBodyCentroMessaggi}></SelectUltimiDueAnni>
                    </div>
                    <div  className="col-3">
                        <SelectMese values={bodyCentroMessaggi} setValue={setBodyCentroMessaggi}></SelectMese>
                    </div>
                </div>
                <div className="d-flex mt-5">
                   
                    <Button 
                        onClick={()=>{
                            console.log('filtra');
                        } } 
                        sx={{ marginTop: 'auto', marginBottom: 'auto'}}
                        variant="contained"> Filtra
                    </Button>
                   
                    <Button
                        onClick={()=> console.log('ANNULLA')}
                        sx={{marginLeft:'24px'}} >
                   Annulla filtri
                    </Button>
                    
                </div>
            </div>
            <div className="marginTop24" style={{display:'flex', justifyContent:'space-between', height:"48px"}}>
                
                {
                    [].length > 0 &&
                <Button onClick={() => console.log('grid')}
                    disabled={false}
                >
                Download Risultati
                    <DownloadIcon sx={{marginRight:'10px'}}></DownloadIcon>
                </Button>
                }
            </div>
            <div className="mt-1 mb-5" style={{ width: '100%'}}>
                <DataGrid sx={{
                    height:'400px',
                    '& .MuiDataGrid-virtualScroller': {
                        backgroundColor: 'white',
                    }
                }}
                onPaginationModelChange={(e)=>{console.log(e);}}
                paginationModel={infoPageListaDatiFat}
                rows={gridData} 
                columns={columns}
                getRowId={(row) => row.id}
                onRowClick={handleEvent}
                onCellClick={handleOnCellClick}
                />
            </div>
            <div>
             
            </div>
            
        </div>
    );

};

export default CentroMessaggi;
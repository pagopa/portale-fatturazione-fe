import { Button, Typography } from "@mui/material";
import DownloadIcon from '@mui/icons-material/Download';
import { DataGrid, GridColDef, GridEventListener, GridRowParams, MuiEvent } from "@mui/x-data-grid";
import { Params } from "../types/typesGeneral";
import { GridElementListaFatturazione } from "../types/typeListaDatiFatturazione";
import { useState } from "react";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const AdesioneBando : React.FC = () => {

    const [gridData, setGridData] = useState<GridElementListaFatturazione[]>([]);

    let columsSelectedGrid = '';
    const handleOnCellClick = (params:Params) =>{
        columsSelectedGrid  = params.field;
    };

    const handleEvent: GridEventListener<'rowClick'> = (
        params:GridRowParams,
        event: MuiEvent<React.MouseEvent<HTMLElement>>,
    ) => {
        event.preventDefault();
        // l'evento verrà eseguito solo se l'utente farà il clik sul 
        console.log('elle');
    };

    const columns: GridColDef[] = [
        { field: 'ragioneSociale', headerName: 'Ragione Sociale', width: 200 , headerClassName: 'super-app-theme--header', headerAlign: 'left',  renderCell: (param:any) => <a className="mese_alidita text-primary fw-bolder" href="/">{param.row.ragioneSociale}</a>},
        { field: 'cup', headerName: 'Cup', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'splitPayment', headerName: 'Split payment', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'idDocumento', headerName: 'ID. Documento', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'dataDocumento', headerName: 'Data Documento', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'codCommessa', headerName: 'Cod. Commessa', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'dataCreazione', headerName: 'Data Primo Acc.', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'dataModifica', headerName: 'Data Ultimo Acc.', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        {field: 'action', headerName: '',sortable: false,width:70,headerAlign: 'left',disableColumnMenu :true,renderCell: (() => ( <ArrowForwardIcon sx={{ color: '#1976D2', cursor: 'pointer' }} onClick={() => console.log('Show page details')} />)),}
    ];

    return (
        <div className="mx-5">
            <div className="marginTop24 ">
                <Typography variant="h4">Adesione al bando</Typography>
            </div>
            <div className="marginTop24" style={{display:'flex', justifyContent:'end'}}>
                {
                    [1].length > 0 &&
                <Button onClick={() =>console.log('download')}
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
                onPaginationModelChange={(e)=>{
                    // setInfoPageListaDatiFat(e); setInfoPageToLocalStorage(e);
                    console.log('ciao');}}
                paginationModel={{ page: 0, pageSize: 100 }}
                rows={gridData} 
                columns={columns}
                getRowId={(row) => row.key}
                onRowClick={handleEvent}
                onCellClick={handleOnCellClick}
                />
            </div>
        </div>
    );

};

export default AdesioneBando;
import { Button, Typography } from "@mui/material";
import DownloadIcon from '@mui/icons-material/Download';
import { DataGrid, GridColDef, GridEventListener, GridRowParams, MuiEvent } from "@mui/x-data-grid";
import { Params } from "../types/typesGeneral";
import { saveAs } from "file-saver";
import { useEffect, useState } from "react";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { downloadDocumentoAsseverazionePagoPa, listaAsseverazionePagopa } from "../api/apiPagoPa/adesioneBandoPA/api";
import { getToken } from "../reusableFunction/actionLocalStorage";
import { AdesioneBandoProps, Asseverazione } from "../types/typeAdesioneBando";
import { manageError } from "../api/api";
import ModalLoading from "../components/reusableComponents/modals/modalLoading";

const AdesioneBando : React.FC<AdesioneBandoProps> = ({mainState, dispatchMainState}) => {

    const token =  getToken();

    const [gridData, setGridData] = useState<Asseverazione[]>([]);
    const [infoPageBando , setInfoPageBando] = useState({ page: 0, pageSize: 100 });
    const [showLoadingGrid,setShowLoadingGrid] = useState(false);

    useEffect(()=>{
        if(mainState.nonce !== ''){
            getListaAsseverazione();
        }
    },[mainState.nonce]);

    const getListaAsseverazione = async ( ) =>{
        setShowLoadingGrid(true);
        await listaAsseverazionePagopa(token,mainState.nonce)
            .then((res)=>{
                setGridData(res.data);
                setShowLoadingGrid(false);
            })
            .catch((err)=>{
                setShowLoadingGrid(false);
                setGridData([]);
                manageError(err,dispatchMainState);
            });
    };

    const downloadListaAdesione = async () => {
        await downloadDocumentoAsseverazionePagoPa(token,mainState.nonce)
            .then((res)=>{
                console.log(res);
                saveAs("data:text/plain;base64," + res.data.documento,`Lista adesione al bando.xlsx` );
            })
            .catch((err)=>{
                manageError(err,dispatchMainState);
            });
    };

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
        { field: 'prodotto', headerName: 'Prodotto', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'tipoContratto', headerName: 'Tipo Contratto', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'asseverazione', headerName: 'Asseverazione', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'calcoloAsseverazione', headerName: 'Calcolo Asseverazione', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'dataAnagrafica', headerName: 'Data Anagrafica', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'tipoCalcoloAsseverazione', headerName: 'Tipo Calcolo Asseverazione', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'idUtente', headerName: 'Id Utente', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        {field: 'action', headerName: '',sortable: false,width:70,headerAlign: 'left',disableColumnMenu :true,renderCell: (() => ( <ArrowForwardIcon sx={{ color: '#1976D2', cursor: 'pointer' }} onClick={() => console.log('Show page details')} />)),}
    ];

    return (
        <div className="mx-5">
            <div className="marginTop24 ">
                <Typography variant="h4">Adesione al bando</Typography>
            </div>
            <div className="marginTop24" style={{display:'flex', justifyContent:'end', height:"48px"}}>
                
                {
                    gridData.length > 0 &&
                <Button onClick={() => downloadListaAdesione()}
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
                    setInfoPageBando(e);}}
                paginationModel={infoPageBando}
                rows={gridData} 
                columns={columns}
                getRowId={(row) => row.idEnte}
                onRowClick={handleEvent}
                onCellClick={handleOnCellClick}
                />
            </div>
            <div>
                <ModalLoading 
                    open={showLoadingGrid} 
                    setOpen={setShowLoadingGrid}
                    sentence={'Loading...'} >
                </ModalLoading>
            </div>
            
        </div>
    );

};

export default AdesioneBando;
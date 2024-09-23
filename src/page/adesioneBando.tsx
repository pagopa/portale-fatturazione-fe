import { Button, Typography } from "@mui/material";
import DownloadIcon from '@mui/icons-material/Download';
import { DataGrid, GridColDef, GridEventListener, GridRowParams, MuiEvent } from "@mui/x-data-grid";
import { Params } from "../types/typesGeneral";
import { saveAs } from "file-saver";
import { useEffect, useState } from "react";
import { downloadDocumentoAsseverazionePagoPa, exportDocumentoAsseverazionePagoPa, listaAsseverazionePagopa, uploadExelAsseverazionePagopa } from "../api/apiPagoPa/adesioneBandoPA/api";
import { getProfilo, getToken } from "../reusableFunction/actionLocalStorage";
import { AdesioneBandoProps, Asseverazione } from "../types/typeAdesioneBando";
import { manageError } from "../api/api";
import ModalLoading from "../components/reusableComponents/modals/modalLoading";
import { SingleFileInput } from "@pagopa/mui-italia";
import ModalUploadPdf from "../components/rel/modalUploadPdf";


const AdesioneBando : React.FC<AdesioneBandoProps> = ({mainState, dispatchMainState}) => {

    const token =  getToken();
    const profilo = getProfilo();

    const [gridData, setGridData] = useState<Asseverazione[]>([]);
    const [infoPageBando , setInfoPageBando] = useState({ page: 0, pageSize: 100 });
    const [showLoadingGrid,setShowLoadingGrid] = useState(false);
    const [showDownloading,setShowDownloading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [loadingUpload, setLoadingUpload] = useState<boolean>(false);
    const [errorUpload, setErrorUpload] = useState<boolean>(false);
    const [openModalConfirmUploadDoc, setOpenModalConfirmUploadDoc] = useState<boolean>(false);

    
    useEffect(()=>{
     
        getListaAsseverazione();
        
    },[]);

  

    const getListaAsseverazione = async ( ) =>{
        setShowLoadingGrid(true);
        await listaAsseverazionePagopa(token, profilo.nonce)
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
        setShowDownloading(true);
        await downloadDocumentoAsseverazionePagoPa(token,profilo.nonce)
            .then((res)=>{
                
                saveAs("data:text/plain;base64," + res.data.documento,`Lista adesione al bando.xlsx` );
                setShowDownloading(false);
            })
            .catch((err)=>{
                setShowDownloading(false);
                manageError(err,dispatchMainState);
            });
    };

    const exportAdesioneDoc = async () => {
        setShowDownloading(true);
        await exportDocumentoAsseverazionePagoPa(token,profilo.nonce)
            .then((res)=>{
               
                saveAs("data:text/plain;base64," + res.data.documento,`Documento asseverazione.xlsx` );
                setShowDownloading(false);
            })
            .catch((err)=>{
                setShowDownloading(false);
                manageError(err,dispatchMainState);
            });
    };

    const uploadAdesioneDoc = async (file) => {
        setShowLoadingGrid(true);
        setErrorUpload(false);
        setLoadingUpload(true);
        
        await uploadExelAsseverazionePagopa(token, profilo.nonce,{file:file}).then((res)=>{
            setShowLoadingGrid(false);
            setOpenModalConfirmUploadDoc(true);
            getListaAsseverazione();
            setFile(null);
            setLoadingUpload(false);
        
        })
            .catch((err)=>{
                setShowLoadingGrid(false);
                setErrorUpload(true);
                manageError(err,dispatchMainState);
                setFile(null);
                setLoadingUpload(false);
                
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
      
    };

    

    const columns: GridColDef[] = [
        { field: 'ragioneSociale', headerName: 'Ragione Sociale', width: 200 , headerClassName: 'super-app-theme--header', headerAlign: 'left',  renderCell: (param:any) => <a className="mese_alidita text-primary fw-bolder" >{param.row.ragioneSociale}</a>},
        { field: 'prodotto', headerName: 'Prodotto', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'tipoContratto', headerName: 'Tipo Contratto', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'dataAnagrafica', headerName: 'Data Ultima Modifica Anagrafica', width: 200, headerClassName: 'super-app-theme--header', headerAlign: 'left',valueFormatter: (value:any) =>  value.value !== null ? new Date(value.value).toLocaleString().split(',')[0] : ''},
        { field: 'calcoloAsseverazione', headerName: 'Calcolo Asseverazione', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'dataAsseverazione', headerName: 'Data Adesione al Bando', width: 200, headerClassName: 'super-app-theme--header', headerAlign: 'left', valueFormatter: (value:any) =>  value.value !== null ? new Date(value.value).toLocaleString().split(',')[0] : ''},
        { field: 'descrizione', headerName: 'Descrizione Bando', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'asseverazione', headerName: 'Adesione al Bando', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        // { field: 'tipoCalcoloAsseverazione', headerName: 'Tipo Calcolo Asseverazione', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        //{ field: 'idUtente', headerName: 'Id Utente', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        // {field: 'action', headerName: '',sortable: false,width:70,headerAlign: 'left',disableColumnMenu :true,renderCell: (() => ( <ArrowForwardIcon sx={{ color: '#1976D2', cursor: 'pointer' }} onClick={() => console.log('Show page details')} />)),}
    ];

    return (
        <div className="mx-5">
            <div className="marginTop24 ">
                <Typography variant="h4">Adesione al bando</Typography>
            </div>
            <div className="marginTop24" style={{display:'flex', justifyContent:'space-between', height:"48px"}}>
                <div className="d-flex">
                    <div className="me-2">
                        <Button variant="contained" onClick={() => exportAdesioneDoc()}
                            disabled={false}
                        >
                Export Doc. Asseverazione
                            <DownloadIcon sx={{marginRight:'10px'}}></DownloadIcon>
                        </Button>
                    </div>
                    <div id='singleInputRel' style={{minWidth: '300px', height:'40px'}}>
                        <SingleFileInput  value={file} loading={loadingUpload} error={errorUpload} accept={[".xlsx"]} onFileSelected={(e)=> uploadAdesioneDoc(e)} onFileRemoved={() => setFile(null)}  dropzoneLabel={"Inserisci il File di Adesione al bando"} rejectedLabel="Tipo file non supportato" ></SingleFileInput>
                    </div> 
                </div>
                
                
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
                    height:'500px',
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
                <ModalLoading 
                    open={showDownloading} 
                    setOpen={setShowDownloading}
                    sentence={'Downloading...'} >
                </ModalLoading>
                <ModalUploadPdf setOpen={setOpenModalConfirmUploadDoc} open={openModalConfirmUploadDoc}></ModalUploadPdf>
            </div>
            
        </div>
    );

};

export default AdesioneBando;
import {  TextField, Typography } from "@mui/material";
import { Box, Button} from '@mui/material';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { DataGrid, GridRowParams,GridEventListener,MuiEvent, GridColDef } from '@mui/x-data-grid';
import DownloadIcon from '@mui/icons-material/Download';
import { PathPf } from "../../types/enum";
import ModalLoading from "../../components/reusableComponents/modals/modalLoading";
import { Params } from "../../types/typesGeneral";
import { manageError } from "../../api/api";
import { OptionMultiselectChackboxPsp, RequestBodyListaAnagraficaPsp } from "../../types/typeAngraficaPsp";
import { getListaAnagraficaPsp, getListaNamePsp } from "../../api/apiPagoPa/anagraficaPspPA/api";
import { GridElementListaFatturazione } from "../../types/typeListaDatiFatturazione";
import { getProfilo, getToken } from "../../reusableFunction/actionLocalStorage";
import MultiselectPsp from "../../components/anagraficaPsp/multiselectPsp";



const AnagraficaPsp:React.FC<any> = ({dispatchMainState}) =>{
    const token =  getToken();
    const profilo =  getProfilo();
    const navigate = useNavigate();
 

    
    const [gridData, setGridData] = useState<GridElementListaFatturazione[]>([]);
    const [statusAnnulla, setStatusAnnulla] = useState('hidden');
    const [filtersDownload, setFiltersDownload] = useState<RequestBodyListaAnagraficaPsp>({
        contractIds:[],
        membershipId: '',
        recipientId: '',
        abi: ''});
    const [bodyGetLista, setBodyGetLista] = useState<RequestBodyListaAnagraficaPsp>({
        contractIds:[],
        membershipId: '',
        recipientId: '',
        abi: ''});
    const [getListaLoading, setGetListaLoading] = useState(false);
    const [dataSelect, setDataSelect] = useState<OptionMultiselectChackboxPsp[]>([]);
    const [infoPageListaPsp , setInfoPageListaPsp] = useState({ page: 0, pageSize: 100 });
    const [textValue, setTextValue] = useState('');
    const [valueAutocomplete, setValueAutocomplete] = useState<OptionMultiselectChackboxPsp[]>([]);
    const [showLoading,setShowLoading] = useState(false);

    
    
    useEffect(()=>{
        /*
        const result = getFiltersFromLocalStorage();
        const infoPageResult = getInfoPageFromLocalStorage();
       
        getProdotti();
        getProfili();
        if(Object.keys(result).length > 0){
            setBodyGetLista(result.bodyGetLista);
            setTextValue(result.textValue);
            setValueAutocomplete(result.valueAutocomplete);
            getListaDatifatturazione(result.bodyGetLista);
            setFiltersDownload(result.bodyGetLista);
        }else{
            getListaDatifatturazione(bodyGetLista);
        }
        if(infoPageResult.page > 0){
            setInfoPageListaDatiFat(infoPageResult);
        }*/
        getListaAnagraficaPspGrid(bodyGetLista);
    }, []);

 


    useEffect(()=>{
        if(bodyGetLista.contractIds?.length  !== 0 || bodyGetLista.membershipId !== '' || bodyGetLista.recipientId !== ''|| bodyGetLista.membershipId){
            setStatusAnnulla('show');
        }else{
            setStatusAnnulla('hidden');
        }
    },[bodyGetLista]);


   
    useEffect(()=>{
        const timer = setTimeout(() => {
            if(textValue.length >= 3){ 
                listaNamePspOnSelect();
            }
        }, 800);
        return () => clearTimeout(timer);
    },[textValue]);



    const getListaAnagraficaPspGrid = async(body:RequestBodyListaAnagraficaPsp) =>{
        setGetListaLoading(true);
        await getListaAnagraficaPsp(token, profilo.nonce, body,0,0)
            .then((res)=>{
                //setGridData(res.data);
                setGetListaLoading(false);
            })
            .catch(((err)=>{
                setGridData([]);
                setGetListaLoading(false);
                manageError(err,dispatchMainState);
            })); 
    };


    // servizio che popola la select con la checkbox
    const listaNamePspOnSelect = async () =>{
        if(profilo.auth === 'PAGOPA'){
            await getListaNamePsp(token, profilo.nonce, {name:textValue} )
                .then((res)=>{
                    setDataSelect(res.data);
                })
                .catch(((err)=>{
                 
                    manageError(err,dispatchMainState);
                   
                }));
        }
    };
    /*
    const onDownloadButton = async() =>{
        setShowLoading(true);
        await downloadDocumentoListaDatiFatturazionePagoPa(token,profilo.nonce, filtersDownload).then((res:ResponseDownloadListaFatturazione) => {
            let fileName = `Lista dati di fatturazione.xlsx`;
            if(gridData.length === 1){
                fileName = `Dati di fatturazione / ${gridData[0]?.ragioneSociale}.xlsx`;
            }
            saveAs("data:text/plain;base64," + res.data.documento,fileName);
            setShowLoading(false);
        }).catch(err => {
            manageError(err,dispatchMainState);
        });
    };
*/
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
        if(columsSelectedGrid  === 'ragioneSociale' || columsSelectedGrid === 'action' ){
            /*setInfoToProfiloLoacalStorage(profilo,{
                idEnte:params.row.idEnte,
                prodotto:params.row.prodotto,
            });*/
            const string = JSON.stringify({nomeEnteClickOn:params.row.ragioneSociale});
            localStorage.setItem('statusApplication', string);
            navigate(PathPf.DATI_FATTURAZIONE);
        }
    };
      
    const columns: GridColDef[] = [
        { field: 'ragioneSociale', headerName: 'Ragione Sociale', width: 200 , headerClassName: 'super-app-theme--header', headerAlign: 'left',  renderCell: (param:any) => <a className="mese_alidita text-primary fw-bolder" href="/">{param.row.ragioneSociale}</a>},
        { field: 'cup', headerName: 'CUP', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'splitPayment', headerName: 'Split payment', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'idDocumento', headerName: 'ID Documento', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'dataDocumento', headerName: 'Data Documento', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left',valueFormatter: (value:any) =>  value.value !== null ? new Date(value.value).toLocaleString().split(',')[0] : ''},
        { field: 'codCommessa', headerName: 'Cod. Commessa', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left' },
        { field: 'dataCreazione', headerName: 'Data Primo Acc.', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left',valueFormatter: (value:{value:string}) =>  value.value !== null ? new Date(value.value).toLocaleString().split(',')[0] : ''},
        { field: 'dataModifica', headerName: 'Data Ultimo Acc.', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'left',valueFormatter: (value:{value:string}) =>  value.value !== null ? new Date(value.value).toLocaleString().split(',')[0] : '' },
        {field: 'action', headerName: '',sortable: false,width:70,headerAlign: 'left',disableColumnMenu :true,renderCell: (() => ( <ArrowForwardIcon sx={{ color: '#1976D2', cursor: 'pointer' }}/>)),}
    ];

    return(
        <div className="mx-5">
            {/*title container start */}
            <div className="marginTop24 ">
                <Typography variant="h4">Anagrafica PSP</Typography>
            </div>
            {/*title container end */}
            <div className="row mb-5 mt-5" >
                <div  className="col-3">
                    <MultiselectPsp 
                        setBodyGetLista={setBodyGetLista}
                        setValueAutocomplete={setValueAutocomplete}
                        dataSelect={dataSelect}
                        valueAutocomplete={valueAutocomplete}
                        setTextValue={setTextValue}/>
                </div>
                <div className="col-3">
                    <Box sx={{width:'80%',marginLeft:'20px'}} >
                        <TextField
                            fullWidth
                            label='Contract ID'
                            placeholder='Contract ID'
                            value={''}
                            onChange={(e) => console.log('contract id')}            
                        />
                    </Box>
                </div>
                <div className="col-3">
                    <Box sx={{width:'80%',marginLeft:'20px'}} >
                        <TextField
                            fullWidth
                            label='Recipient ID'
                            placeholder='Contract ID'
                            value={''}
                            onChange={(e) => console.log('contract id')}            
                        />
                    </Box>
                </div>
                <div className="col-3">
                    <Box sx={{width:'80%',marginLeft:'20px'}} >
                        <TextField
                            fullWidth
                            label='ABI'
                            placeholder='ABI'
                            value={''}
                            onChange={(e) => console.log('ABI')}            
                        />
                    </Box>
                </div>
               
            </div>
            <div className="d-flex" >
              
                <div className=" d-flex justify-content-center align-items-center">
                    <div>
                        <Button 
                            onClick={()=>{
                                /* getListaDatifatturazione(bodyGetLista);
                                setInfoPageListaDatiFat({ page: 0, pageSize: 100 });
                                setFiltersDownload(bodyGetLista);
                                setFilterToLocalStorage(bodyGetLista,textValue,valueAutocomplete);
                                setInfoPageToLocalStorage({ page: 0, pageSize: 100 }); */
                                getListaAnagraficaPspGrid(bodyGetLista);
                            } } 
                            sx={{ marginTop: 'auto', marginBottom: 'auto'}}
                            variant="contained"> Filtra
                        </Button>
                        {statusAnnulla === 'hidden'? null :
                            <Button
                                onClick={()=>{
                                    const newBody = {
                                        contractIds:[],
                                        membershipId: '',
                                        recipientId: '',
                                        abi: ''};
                                    getListaAnagraficaPspGrid(newBody);
                                    setBodyGetLista(newBody);
                                    setFiltersDownload(newBody);
                                    setDataSelect([]);
                                    setValueAutocomplete([]);
                                    
                                    /*setBodyGetLista({idEnti:[],prodotto:'',profilo:''});
                                    setInfoPageListaDatiFat({ page: 0, pageSize: 100 });
                                    setInfoPageToLocalStorage({ page: 0, pageSize: 100 });
                                    getListaDatifatturazione({idEnti:[],prodotto:'',profilo:''});
                                    setFiltersDownload({idEnti:[],prodotto:'',profilo:''});
                                    setDataSelect([]);
                                    setValueAutocomplete([]);
                                    deleteFilterToLocalStorage();*/
                                } }
                                sx={{marginLeft:'24px'}} >
                        Annulla filtri
                            </Button>}
                    </div>
                </div>
            </div>
            {/* grid */}
            <div className="marginTop24" style={{display:'flex', justifyContent:'end'}}>
                {
                    gridData.length > 0 &&
                <Button onClick={() =>//onDownloadButton()
                    console.log('download')}
                disabled={getListaLoading}
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
                    setInfoPageListaPsp(e);
                    // setInfoPageToLocalStorage(e);
                }}
                paginationModel={infoPageListaPsp}
                rows={gridData} 
                columns={columns}
                getRowId={(row) => row.key}
                onRowClick={handleEvent}
                onCellClick={handleOnCellClick}
                />
            </div>
            <div>
            </div>
            <ModalLoading 
                open={showLoading} 
                setOpen={setShowLoading}
                sentence={'Downloading...'} >
            </ModalLoading>
        </div>
    );
}; 
export default AnagraficaPsp;
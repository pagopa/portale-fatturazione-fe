import {  TextField, Typography } from "@mui/material";
import { Box, Button} from '@mui/material';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import {  GridColDef } from '@mui/x-data-grid';
import DownloadIcon from '@mui/icons-material/Download';
import ModalLoading from "../../components/reusableComponents/modals/modalLoading";
import { manageError } from "../../api/api";
import { OptionMultiselectChackboxPsp, RequestBodyListaAnagraficaPsp } from "../../types/typeAngraficaPsp";
import { getListaAnagraficaPsp, getListaNamePsp } from "../../api/apiPagoPa/anagraficaPspPA/api";
import { GridElementListaFatturazione } from "../../types/typeListaDatiFatturazione";
import { getProfilo, getToken } from "../../reusableFunction/actionLocalStorage";
import MultiselectPsp from "../../components/anagraficaPsp/multiselectPsp";
import GridCustom from "../../components/reusableComponents/grid/gridCustom";



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
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalPsp, setTotalPsp]  = useState(0);
    const [textValue, setTextValue] = useState<string>('');
    const [valueAutocomplete, setValueAutocomplete] = useState<OptionMultiselectChackboxPsp[]>([]);
    const [showLoading,setShowLoading] = useState(false);

    console.log(valueAutocomplete,bodyGetLista);
    
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
        const realPage = page + 1;
        getListaAnagraficaPspGrid(bodyGetLista,realPage,rowsPerPage);
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



    const getListaAnagraficaPspGrid = async(body:RequestBodyListaAnagraficaPsp, page:number,rowsPerPage:number) =>{
        setGetListaLoading(true);
        await getListaAnagraficaPsp(token, profilo.nonce, body,page,rowsPerPage)
            .then((res)=>{

             
                // ordino i dati in base all'header della grid
                const orderDataCustom = res.data.psPs.map((obj)=>{
                    // inserire come prima chiave l'id se non si vuol renderlo visibile nella grid
                    // 'id serve per la chiamata get dettaglio dell'elemento selezionato nella grid
                    return {
                        contractId:obj.contractId,
                        documentName:obj.name,
                        contractId2:obj.contractId,
                        providerNames:obj.providerNames,
                        pecMail:obj.pecMail,
                        sdiCode:obj.sdiCode,
                        abi:obj.abi,
                        referenteFatturaMail:obj.referenteFatturaMail,
                        signedDate:new Date(obj.signedDate).toISOString().split('T')[0],
                    };
                });
                setGridData(orderDataCustom);
                setTotalPsp(res.data.count);
                console.log(res);
                setGetListaLoading(false);
            })
            .catch(((err)=>{
                setGridData([]);
                setTotalPsp(0);
                setGetListaLoading(false);
                manageError(err,dispatchMainState);
            })); 
    };


    // servizio che popola la select con la checkbox
    const listaNamePspOnSelect = async () =>{
       
        await getListaNamePsp(token, profilo.nonce, {name:textValue} )
            .then((res)=>{
                setDataSelect(res.data);
            })
            .catch(((err)=>{
                manageError(err,dispatchMainState); 
            }));
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

    const onButtonFiltra = () =>{
        setPage(0);
        setRowsPerPage(10);
        setFiltersDownload(bodyGetLista);
        getListaAnagraficaPspGrid(bodyGetLista,1,10); 
        //setFilterToLocalStorageRel(bodyRel,textValue,valueAutocomplete, 0, 10,valuetipologiaFattura);
    };
    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number,
    ) => {
        const realPage = newPage + 1;
        getListaAnagraficaPspGrid(bodyGetLista,realPage, rowsPerPage);
        setPage(newPage);
  
        //setFilterToLocalStorageRel(bodyDownload,textValue,valueAutocomplete, newPage, rowsPerPage,valuetipologiaFattura);
    };
                
    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
        const realPage = page + 1;
        getListaAnagraficaPspGrid(bodyGetLista,realPage,parseInt(event.target.value, 10));

        // setFilterToLocalStorageRel(bodyDownload,textValue,valueAutocomplete, page, parseInt(event.target.value, 10),valuetipologiaFattura);
    };
      
 

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
                            label='Membership ID'
                            placeholder='Membership ID'
                            value={''}
                            onChange={(e) => console.log('member id')}            
                        />
                    </Box>
                </div>
                <div className="col-3">
                    <Box sx={{width:'80%',marginLeft:'20px'}} >
                        <TextField
                            fullWidth
                            label='Recipient ID'
                            placeholder='Recipient ID'
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
                            onClick={()=> {
                                /* getListaDatifatturazione(bodyGetLista);
                                setInfoPageListaDatiFat({ page: 0, pageSize: 100 });
                                setFiltersDownload(bodyGetLista);
                                setFilterToLocalStorage(bodyGetLista,textValue,valueAutocomplete);
                                setInfoPageToLocalStorage({ page: 0, pageSize: 100 }); */
                                //getListaAnagraficaPspGrid(bodyGetLista,page,rowsPerPage);
                                onButtonFiltra();
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
                                    getListaAnagraficaPspGrid(newBody,1,10);
                                    setBodyGetLista(newBody);
                                    setFiltersDownload(newBody);
                                    setRowsPerPage(10);
                                    setPage(0);
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
                <GridCustom
                    nameParameterApi='contractId'
                    elements={gridData}
                    changePage={handleChangePage}
                    changeRow={handleChangeRowsPerPage} 
                    total={totalPsp}
                    page={page}
                    rows={rowsPerPage}
                    headerNames={['Nome PSP','ID Contratto','Nome Fornitore','PEC','SDI','ABI','E-Mail Ref. Fattura','Data','']}
                    disabled={getListaLoading}></GridCustom>
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
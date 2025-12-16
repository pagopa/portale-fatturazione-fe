import React, {useState, useEffect, useRef} from 'react';
import { manageError } from '../../api/api';
import { Button, Box, Typography, FormControl, InputLabel,Select, MenuItem, Skeleton} from '@mui/material';
import { useNavigate } from 'react-router';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { DataGridCommessa, GetAnniResponse, ResponseGetListaCommesse } from '../../types/typeModuloCommessaElenco';
import { getAnni, getListaCommessaFilteredV2, getCommessaObbligatoriVerificaV2 } from '../../api/apiSelfcare/moduloCommessaSE/api';
import ModalRedirect from '../../components/commessaInserimento/madalRedirect';
import {  fixResponseForDataGridRollBack } from '../../reusableFunction/function';
import { PathPf } from '../../types/enum';
import { ManageErrorResponse } from '../../types/typesGeneral';
import GridCustom from '../../components/reusableComponents/grid/gridCustom';
import ModalInfo from '../../components/reusableComponents/modals/modalInfo';
import useSavedFilters from '../../hooks/useSaveFiltersLocalStorage';
import { subHeaderNameModComTrimestraleENTE } from '../../assets/configurations/config_SubGridModComEnte';
import ModalLoading from '../../components/reusableComponents/modals/modalLoading';
import { CustomButton } from '../../components/reusableComponents/layout/mainComponent';
import { useGlobalStore } from '../../store/context/useGlobalStore';


const ModuloCommessaElencoUtPa: React.FC = () => {

    const mainState = useGlobalStore(state => state.mainState);
    const dispatchMainState = useGlobalStore(state => state.dispatchMainState);

    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;
    const navigate = useNavigate();

    let profilePathModuloCommessa; 
        
    if(profilo.auth === 'PAGOPA'){
        profilePathModuloCommessa = PathPf.MODULOCOMMESSA;
    }else{
        profilePathModuloCommessa = PathPf.MODULOCOMMESSA_EN;
    }
  
    const [valueSelect, setValueSelect] = useState('');
    
    const handleModifyMainState = (valueObj) => {
        dispatchMainState({
            type:'MODIFY_MAIN_STATE',
            value:valueObj
        });
    };
    const sentenseRef = useRef<boolean|null>(null);

    const [anni, setAnni] = useState<string[]>([]);
    const [gridData, setGridData] = useState<DataGridCommessa[]>([]);
    const [openModalRedirect, setOpenModalRedirect] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totDoc,setTotDoc] = useState(0);
    const [loadingMandatory, setLoadingMandatory] = useState(true);
    const [showButtonInsertModulo,setShowButtonInsertModulo] = useState(false);
    const [openModalModObbligatori,setOpenModalModObbligatori] = useState({open:false,sentence:''});
    const [isMandatory, setIsMandatory] = useState(null);
    const [showLoadingLista,setShowLoadingLista] = useState(false);

    const { 
        filters,
        updateFilters,
        resetFilters,
        isInitialRender
    } = useSavedFilters(PathPf.LISTA_COMMESSE,{});


    useEffect(()=>{
        if(mainState.datiFatturazione === false || mainState.datiFatturazioneNotCompleted){
            setOpenModalRedirect(true);
            setLoadingMandatory(false);
        }else{
            verificaObbligatoriToInsert();
        }
    },[mainState.datiFatturazione,mainState.datiFatturazioneNotCompleted]);


    const verificaObbligatoriToInsert = async() => {
        await getCommessaObbligatoriVerificaV2(token, profilo.nonce).then((res)=>{
            const redirect =  localStorage.getItem('redirectToInsert')||"";
            const redirectToInsert =  JSON.parse(redirect);
            setIsMandatory(res.data);
            if(res.data && redirectToInsert){
                navigate(profilePathModuloCommessa);
            }else{
                localStorage.setItem('redirectToInsert',JSON.stringify(false));
                getAnniSelect();
                if(isInitialRender.current && Object.keys(filters).length > 0){
                    getListaCommessaGrid(filters.valueSelect);
                    setValueSelect(filters.valueSelect);
                  
                }else{
                 
                    getListaCommessaGrid('');
                }
                handleModifyMainState({infoTrimestreComSelected:{}});
                setLoadingMandatory(false);
            }
            setShowButtonInsertModulo(res.data);
        }).catch((err)=>{
            setLoadingMandatory(false);
            manageError(err,dispatchMainState);//:TODO forse da eliminare
        });
    };

    const getAnniSelect = async () =>{
        await getAnni(token, profilo.nonce).then((res:GetAnniResponse)=>{
            setAnni(res.data);
        }).catch((err:ManageErrorResponse)=>{
            // manageError(err,dispatchMainState);
        });
    };

    // servizio che popola la grid con la lista commesse
    const getListaCommessaGrid = async (valueAnno) =>{
        setShowLoadingLista(true);
        await getListaCommessaFilteredV2(token , profilo.nonce,valueAnno).then((res:ResponseGetListaCommesse)=>{
            //const finalData = fixResponseForDataGrid(res.data);
            const finalData = fixResponseForDataGridRollBack(res.data);
            setGridData(finalData);
            setShowLoadingLista(false);
            if(sentenseRef.current === null){
                sentenseRef.current = true;
            }
            
        }).catch((err:ManageErrorResponse)=>{
            setGridData([]);
            manageError(err,dispatchMainState);
            setShowLoadingLista(false);
            if(sentenseRef.current === null){
                sentenseRef.current = false;
            }
            
        });
    };
   

    const handleListItemClickModuloCommessa = async () => {
        //cliccando sulla side nav Modulo commessa e sono un ente qualsiasi
        navigate(profilePathModuloCommessa);
    };

    //_________________________________NUOVA LOGICA

    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number,
    ) => {
        //listaDoc(bodyGetLista,newPage, rowsPerPage);
        setPage(newPage);
    };
                    
    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
        //listaDoc(bodyGetLista,page,parseInt(event.target.value, 10));  
    };

    const headerAction = () => {
        console.log("action");
    };

    const handleClickOnDetail = (el) => {
        
        /*const isMandatory = gridData?.map(el => el?.moduli?.map(el => (el.source === "obbligatorio" && el.stato === "Obbligatorio" && el.inserimento.inserimento === "Non inserito") ? true:false)).flat().includes(true);
        const isMandatory = gridData?.map((el => {
            if(el.source === "obbligatorio" && el.stato === "Obbligatorio"){
                return true;
            }else{
                return false;
            }
        })).includes(true);
        const quarterSelected = gridData.find(dataEl => dataEl.id === el.quarter); 
        const quarterSelectedIndex = gridData.findIndex(dataEl => dataEl.id === el.quarter);
        const moduloSelectedIndex =  quarterSelected?.moduli?.findIndex(elMod => elMod.id === el.id);
        const result:any[] = [];
        try{
            for (const item of quarterSelected?.moduli||[]) {
                if (isMandatory){
                 
                    if(item.source === "archiviato"){
                        console.log("dentro");
                        result.push(item);
                    }else{
                        result;
                    }
                }else{
                    result.push(item);
                }
            }
        }catch(err){
            console.log(err);
        }
       */
     
        if( isMandatory && el.source === "facoltativo" ){
            setOpenModalModObbligatori({open:true,sentence:'Per inserire i moduli commessa futuri bisogna prima inserire i moduli commessa OBBLIGATORI'});
        }else if(isMandatory && el.source === "archiviato"){
            /*  handleModifyMainState({infoTrimestreComSelected:{
                meseCommessaSelected:el.id.length === 6 ? el.id.slice(0,1):el.id.slice(0,2),
                annoCommessaSelectd:el.id.length === 6 ?el.id.slice(2,6):el.id.slice(3,7),
                moduli:result,
                quarterSelectedIndex,
                moduloSelectedIndex,
                idTipoContratto: profilo.idTipoContratto,
                prodotto:profilo.prodotto,
                idEnte:profilo.idEnte,
            }});*/
            handleModifyMainState({infoTrimestreComSelected:{
                meseCommessaSelected:el.id.length === 6 ? el.id.slice(0,1):el.id.slice(0,2),
                annoCommessaSelectd:el.id.length === 6 ?el.id.slice(2,6):el.id.slice(3,7),
                moduli:[el],
                quarterSelectedIndex:0,
                moduloSelectedIndex:0,
                idTipoContratto: profilo.idTipoContratto,
                prodotto:profilo.prodotto,
                idEnte:profilo.idEnte,
            }});
            navigate(profilePathModuloCommessa);
        }else if(!isMandatory){
            /*handleModifyMainState({infoTrimestreComSelected:{
                meseCommessaSelected:el.id.length === 6 ? el.id.slice(0,1):el.id.slice(0,2),
                annoCommessaSelectd:el.id.length === 6 ?el.id.slice(2,6):el.id.slice(3,7),
                moduli:result,
                quarterSelectedIndex,
                moduloSelectedIndex,
                idTipoContratto: profilo.idTipoContratto,
                prodotto:profilo.prodotto,
                idEnte:profilo.idEnte,
            }});*/
            handleModifyMainState({infoTrimestreComSelected:{
                meseCommessaSelected:el.id.length === 6 ? el.id.slice(0,1):el.id.slice(0,2),
                annoCommessaSelectd:el.id.length === 6 ?el.id.slice(2,6):el.id.slice(3,7),
                moduli:[el],
                quarterSelectedIndex:0,
                moduloSelectedIndex:0,
                idTipoContratto: profilo.idTipoContratto,
                prodotto:profilo.prodotto,
                idEnte:profilo.idEnte,
            }});
            navigate(profilePathModuloCommessa);
        }else if(isMandatory && el.source === "obbligatorio"){
            navigate(profilePathModuloCommessa);
        }
      
        
    };
    //_________________________________________________________
    return (
        <>
            {loadingMandatory ?
                <Box
                    sx={{
                        padding:"24px",
                        height: '100vh'
                    }}
                >
                    <Skeleton variant="rectangular" height="100%" />
                </Box>
                :
                <div className="mx-5">
                    <div className='marginTop24'>
                        <Typography variant="h4">Modulo commessa</Typography>
                    </div>
                    <div className=" d-flex justify-content-between mb-5  mt-5">
                        <div className='d-flex'>
                            <Box sx={{ width: 300 }}>
                                <FormControl
                                    fullWidth
                                    size="medium"
                                >
                                    <InputLabel>
                            Filtra per anno
                                    </InputLabel>
                                    <Select
                                        label="Filtra per anno"
                                        onChange={(e) =>{setValueSelect(e.target.value);}  }
                                        value={valueSelect}
                                        IconComponent={ArrowDropDownIcon}
                                    >
                                        {anni.map((el) => (
                                            <MenuItem
                                                key={Math.random()}
                                                value={el}
                                            >
                                                {el}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>
                            <Box sx={{display: 'flex',
                                justifyContent: 'center',   
                                alignItems: 'center',
                                marginLeft:"40px" }}>
                                <CustomButton onClick={()=>{
                                    getListaCommessaGrid(valueSelect);
                                    updateFilters({valueSelect,pathPage:PathPf.LISTA_COMMESSE,});
                                }} variant="contained" disabled={valueSelect === ''}>
                                    Filtra
                                </CustomButton>
                                {valueSelect !== '' &&
                                <CustomButton sx={{marginLeft:"40px"}} onClick={()=>{
                                    setValueSelect('');
                                    getListaCommessaGrid('');
                                    resetFilters();
                                }} variant="text" disabled={valueSelect === ''}>
                                    Annulla filtri
                                </CustomButton>
                                }
                            </Box>
                        </div>
                        {showButtonInsertModulo &&
                            <Button  sx={{ marginTop: 'auto', marginBottom: 'auto', marginLeft: '30px' }} variant="contained" onClick={()=>{
                                handleListItemClickModuloCommessa();
                            }}>Inserisci modulo commessa</Button>
                        }
                    </div>
                    <div className='mb-5'>
                        {sentenseRef.current === null ? (
                            <Skeleton variant="text" width="100%" height={30} />
                        ) : (
                            <Typography variant="caption-semibold">
                                {sentenseRef.current === false
                                    ? "N.B. Gentile Aderente, non sono presenti moduli commessa inseriti. L'inserimento è possibile solo dal 1° al 15 di ogni mese. La finestra di inserimento è attualmente chiusa. Ritorna dal 1° del prossimo mese per compilare i moduli obbligatori"
                                    : "N.B. il Modulo Commessa per le previsioni dei consumi deve essere inserito dal giorno 1 al giorno 15 di ogni mese"
                                }
                            </Typography>
                        )}
                    </div>
                    <div className='mb-5'>
                        <GridCustom
                            nameParameterApi='modComTrimestrale'
                            elements={gridData}
                            changePage={handleChangePage}
                            changeRow={handleChangeRowsPerPage} 
                            total={totDoc}
                            page={page}
                            rows={rowsPerPage}
                            headerNames={subHeaderNameModComTrimestraleENTE}
                            apiGet={handleClickOnDetail}
                            disabled={false}
                            headerAction={headerAction}
                            body={valueSelect}
                            widthCustomSize="auto"
                            paginationVisibile={false}></GridCustom>
                
                    </div>
                    <ModalRedirect 
                        setOpen={setOpenModalRedirect}
                        open={openModalRedirect}
                        sentence={`Per poter inserire il modulo commessa è obbligatorio fornire  i seguenti dati di fatturazione:`}></ModalRedirect>
                    <ModalInfo 
                        setOpen={setOpenModalModObbligatori}
                        open={openModalModObbligatori}></ModalInfo>
                    <ModalLoading 
                        open={showLoadingLista} 
                        setOpen={setShowLoadingLista}
                        sentence={'Loading...'} >
                    </ModalLoading>
                </div>
            }
        </>
    );
};
export default  ModuloCommessaElencoUtPa;



import React, {useState, useEffect, useContext} from 'react';
import { manageError, redirect } from '../api/api';
import { Button, Box, Typography, FormControl, InputLabel,Select, MenuItem,} from '@mui/material';
import GridComponent from '../components/commessaElenco/grid';
import { useNavigate } from 'react-router';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { DataGridCommessa , GetAnniResponse, ResponseGetListaCommesse} from '../types/typeModuloCommessaElenco';
import { ManageErrorResponse } from '../types/typesGeneral';
import { getAnni, getDatiModuloCommessa, getListaCommessaFiltered } from '../api/apiSelfcare/moduloCommessaSE/api';
import ModalRedirect from '../components/commessaInserimento/madalRedirect';
import { getDatiFatturazione } from '../api/apiSelfcare/datiDiFatturazioneSE/api';
import { PathPf } from '../types/enum';
import { profiliEnti } from '../reusableFunction/actionLocalStorage';
import { fixResponseForDataGrid } from '../reusableFunction/function';
import { GlobalContext } from '../store/context/globalContext';

const ModuloCommessaElencoUtPa: React.FC = () => {

    const globalContextObj = useContext(GlobalContext);
    const {dispatchMainState, mainState} = globalContextObj;

    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;
    const navigate = useNavigate();
    const enti = profiliEnti(mainState);

    const [valueSelect, setValueSelect] = useState('');
    
    const handleModifyMainState = (valueObj) => {
        dispatchMainState({
            type:'MODIFY_MAIN_STATE',
            value:valueObj
        });
    };

    const [anni, setAnni] = useState<string[]>([]);
    const [gridData, setGridData] = useState<DataGridCommessa[]>([]);
    const [openModalRedirect, setOpenModalRedirect] = useState(false);
  
    useEffect(()=>{
    
        if(mainState.datiFatturazione === false || mainState.datiFatturazioneNotCompleted){
            setOpenModalRedirect(true);
        }
    },[]);

    // nel caso in cui un utente apre un altra tab e accede come un utente diverso le chiamate andranno in errore
    // nel beck è stato implementato un controllo basato sul nonce
    useEffect(()=>{
        getAnniSelect();
        getListaCommessaGrid('');
    },[]);
    
    // se il token non c'è viene fatto il redirect al portale di accesso
    useEffect(()=>{
        if(token === undefined){
            window.location.href = redirect;
        }
    },[]);

    const getAnniSelect = async () =>{
        await getAnni(token, profilo.nonce).then((res:GetAnniResponse)=>{
            setAnni(res.data);
        }).catch((err:ManageErrorResponse)=>{
            // manageError(err,dispatchMainState);
        });
    };

    // servizio che popola la grid con la lista commesse
    const getListaCommessaGrid = async (valueAnno) =>{
        await getListaCommessaFiltered(token , profilo.nonce,valueAnno).then((res:ResponseGetListaCommesse)=>{
            const finalData = fixResponseForDataGrid(res.data);
            setGridData(finalData);
        }).catch((err:ManageErrorResponse)=>{
            setGridData([]);
            manageError(err,dispatchMainState);
        });
    };

    const getDatiFat = async () =>{
        await getDatiFatturazione(token,profilo.nonce).then(( ) =>{      
            handleModifyMainState({datiFatturazione:true});
        }).catch(err =>{
            if(err?.response?.status === 404){
                handleModifyMainState({datiFatturazione:false});
            }
        });
    };

    const handleListItemClickModuloCommessa = async () => {
        if(profilo.auth === 'PAGOPA'){
            //cliccando sulla side nav Modulo commessa e sono l'ente PAGOPA
            navigate(PathPf.LISTA_MODULICOMMESSA);
        }else{
            //cliccando sulla side nav Modulo commessa e sono un ente qualsiasi
            await getDatiFat();
            await getDatiModuloCommessa(token, profilo.nonce).then((res)=>{
                if(res.data.modifica === true && res.data.moduliCommessa.length === 0 ){
                        
                    handleModifyMainState({
                        inserisciModificaCommessa:'INSERT',
                        statusPageInserimentoCommessa:'mutable',
                        userClickOn:undefined,
                        primoInserimetoCommessa:true,
                        mese:res.data.mese,
                        anno:res.data.anno,
                    });
                    navigate(PathPf.MODULOCOMMESSA);
                }else if(res.data.modifica === true && res.data.moduliCommessa.length > 0 ){
    
                    handleModifyMainState({
                        inserisciModificaCommessa:'MODIFY',
                        statusPageInserimentoCommessa:'immutable',
                        primoInserimetoCommessa:false});

                    navigate(PathPf.LISTA_COMMESSE);
                }else if(res.data.modifica === false && res.data.moduliCommessa.length === 0){

                    handleModifyMainState({
                        inserisciModificaCommessa:'NO_ACTION',
                        statusPageInserimentoCommessa:'immutable',
                        primoInserimetoCommessa:false});
        
                    navigate(PathPf.LISTA_COMMESSE);
                }else if(res.data.modifica === false && res.data.moduliCommessa.length > 0){
                    handleModifyMainState({
                        inserisciModificaCommessa:'NO_ACTION',
                        statusPageInserimentoCommessa:'immutable',
                        primoInserimetoCommessa:false}); 

                    navigate(PathPf.LISTA_COMMESSE);
                }
            }).catch((err) =>{
                manageError(err,dispatchMainState);
            });
        }
    };
    return (

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
                            <InputLabel
                                id="Filtra per anno"
                            >
                            Filtra per anno
                            </InputLabel>
                            <Select
                                id="sea"
                                label="Anno"
                                labelId="search-by-label"
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
                    <Box sx={{ display: 'flex' }}>
                        <Button
                            variant="contained"
                            disabled={valueSelect === ''}
                            sx={{ marginTop: 'auto', marginBottom: 'auto', marginLeft: '30px' }}
                            onClick={()=>getListaCommessaGrid(valueSelect)}
                        >
            Filtra 
                        </Button>
                        {valueSelect !== '' &&
                            <Typography
                                variant="caption-semibold"
                                onClick={()=>{setValueSelect(''); getListaCommessaGrid('');}}
                                sx={{
                                    marginTop: 'auto',
                                    marginBottom: 'auto',
                                    marginLeft: '30px',
                                    cursor: 'pointer',
                                    color: '#0062C3',
                                }}
                            >
            Annulla filtri
                            </Typography>
                        }
                    </Box>
                </div>
                {(mainState.primoInserimetoCommessa && enti) &&
                <Button variant="contained" onClick={()=>{
                    handleListItemClickModuloCommessa();
                }}>Inserisci modulo commessa</Button>
                }
            </div>
            <div className='mb-5'>
                <Typography variant="caption-semibold">N.B. il Modulo Commessa per le previsioni dei consumi deve essere inserito dal giorno 1 al giorno 15 di ogni mese</Typography>
            </div>
            <div className='mb-5'>
                <GridComponent data={gridData} dispatchMainState={dispatchMainState} mainState={mainState} />
            </div>
            <ModalRedirect 
                setOpen={setOpenModalRedirect}
                open={openModalRedirect}
                sentence={`Per poter inserire il modulo commessa è obbligatorio fornire  i seguenti dati di fatturazione:`}></ModalRedirect>
        </div>
    );
};
export default  ModuloCommessaElencoUtPa;

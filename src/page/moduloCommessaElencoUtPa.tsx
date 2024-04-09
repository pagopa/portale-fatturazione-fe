import React, {useState, useEffect} from 'react';
import { manageError, redirect } from '../api/api';
import { Button, Box, Typography, FormControl, InputLabel,Select, MenuItem,} from '@mui/material';
import GridComponent from '../components/commessaElenco/grid';
import { useNavigate } from 'react-router';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { VisualModuliCommessaProps,  DataGridCommessa , GetAnniResponse, ResponseGetListaCommesse} from '../types/typeModuloCommessaElenco';
import { ManageErrorResponse } from '../types/typesGeneral';
import { getAnni, getDatiModuloCommessa, getListaCommessaFiltered } from '../api/apiSelfcare/moduloCommessaSE/api';
import ModalRedirect from '../components/commessaInserimento/madalRedirect';
import { getDatiFatturazione } from '../api/apiSelfcare/datiDiFatturazioneSE/api';
import useIsTabActive from '../reusableFunctin/tabIsActiv';

const ModuloCommessaElencoUtPa: React.FC<VisualModuliCommessaProps> = ({dispatchMainState,mainState, valueSelect, setValueSelect}) => {

    const getProfilo = localStorage.getItem('profilo') || '{}';
    const profilo =  JSON.parse(getProfilo);
  
    const getToken = localStorage.getItem('token') || '{}';
    const token =  JSON.parse(getToken).token;

    const state = localStorage.getItem('statusApplication') || '{}';
    const statusApp =  JSON.parse(state);

    const handleModifyMainState = (valueObj) => {
        dispatchMainState({
            type:'MODIFY_MAIN_STATE',
            value:valueObj
        });
    };


    const tabActive = useIsTabActive();
    useEffect(()=>{
        if(tabActive === true && (mainState.nonce !== profilo.nonce)){
            window.location.href = redirect;
        }
    },[tabActive, mainState.nonce]);
   
    const navigate = useNavigate();

    const month = ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre",'Gennaio'];

  
    useEffect(()=>{
        handleModifyMainState(statusApp);
        if(statusApp.datiFatturazione === false){
            setOpenModalRedirect(true);
        }
  
    },[]);

    const [anni, setAnni] = useState<string[]>([]);
   

    const [gridData, setGridData] = useState<DataGridCommessa[]>([]);
    
    const [openModalRedirect, setOpenModalRedirect] = useState(false);
    // il componente data grid ha bisogno di un id per ogni elemento
    const fixResponseForDataGrid = (arr:DataGridCommessa[]) =>{
      
        const result = arr.map( (singlObj:DataGridCommessa) =>{
            
            return {
                id : Math.random(),
                ...singlObj
            };
        } );
        return result;
    };

    // servizio che  popola la select anni
    const getAnniSelect = async () =>{

        await getAnni(token, mainState.nonce).then((res:GetAnniResponse)=>{
           
            setAnni(res.data);
        }).catch((err:ManageErrorResponse)=>{
            manageError(err, navigate);
        });
    };

    // servizio che popola la grid con la lista commesse
    const getListaCommessaGrid = async (valueAnno) =>{

        await getListaCommessaFiltered(token , mainState.nonce,valueAnno).then((res:ResponseGetListaCommesse)=>{
            
            const finalData = fixResponseForDataGrid(res.data);
            setGridData(finalData);
        }).catch((err:ManageErrorResponse)=>{
            manageError(err, navigate);
        });
    };

    // nel caso in cui un utente apre un altra tab e accede come un utente diverso le chiamate andranno in errore
    // nel beck è stato implementato un controllo basato sul nonce
    useEffect(()=>{
        if(mainState.nonce !== ''){
            getAnniSelect();
            getListaCommessaGrid('');
        }
        
    },[mainState.nonce]);
    
    // se il token non c'è viene fatto il redirect al portale di accesso
    useEffect(()=>{
        if(token === undefined){
            window.location.href = redirect;
        }
    },[]);
  

    const getDatiFat = async () =>{
        await getDatiFatturazione(token,mainState.nonce).then(( ) =>{      
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
            navigate('/pagopalistamodulicommessa');

        }else{
            //cliccando sulla side nav Modulo commessa e sono un ente qualsiasi
            await getDatiFat();
            await getDatiModuloCommessa(token, mainState.nonce).then((res)=>{

                if(res.data.modifica === true && res.data.moduliCommessa.length === 0 ){
                    handleModifyMainState({
                        inserisciModificaCommessa:'INSERT',
                        statusPageInserimentoCommessa:'mutable',
                        userClickOn:undefined,
                        primoInserimetoCommessa:true
                    });
                 
                    const newState = {
                        mese:res.data.mese,
                        anno:res.data.anno,
                        inserisciModificaCommessa:'INSERT',
                        datiFatturazione:mainState.datiFatturazione,
                        userClickOn:undefined,
                        primoInserimetoCommessa:true
                    };

                    const statusApp = localStorage.getItem('statusApplication')||'{}';
                    const parseStatusApp = JSON.parse(statusApp);
            
                    localStorage.setItem('statusApplication',JSON.stringify({...parseStatusApp,
                        ...newState}));
                 
                    navigate('/8');
                }else if(res.data.modifica === true && res.data.moduliCommessa.length > 0 ){
    
                    handleModifyMainState({
                        inserisciModificaCommessa:'MODIFY',
                        statusPageInserimentoCommessa:'immutable',
                        primoInserimetoCommessa:false});
    
                    const newState = {
                        inserisciModificaCommessa:'MODIFY',
                        datiFatturazione:mainState.datiFatturazione,
                        primoInserimetoCommessa:false
                    };
                    const statusApp = localStorage.getItem('statusApplication')||'{}';
                    const parseStatusApp = JSON.parse(statusApp);
            
                    localStorage.setItem('statusApplication',JSON.stringify({...parseStatusApp,
                        ...newState}));
                   
                    navigate('/4');
                }else if(res.data.modifica === false && res.data.moduliCommessa.length === 0){

                    handleModifyMainState({
                        inserisciModificaCommessa:'NO_ACTION',
                        statusPageInserimentoCommessa:'immutable',
                        primoInserimetoCommessa:false});
                
                    const newState = {
                        inserisciModificaCommessa:'NO_ACTION',
                        datiFatturazione:mainState.datiFatturazione,
                        primoInserimetoCommessa:false
                    };
                    const statusApp = localStorage.getItem('statusApplication')||'{}';
                    const parseStatusApp = JSON.parse(statusApp);
            
                    localStorage.setItem('statusApplication',JSON.stringify({...parseStatusApp,
                        ...newState}));
                   
                    navigate('/4');
                }else if(res.data.modifica === false && res.data.moduliCommessa.length > 0){
                    handleModifyMainState({
                        inserisciModificaCommessa:'NO_ACTION',
                        statusPageInserimentoCommessa:'immutable',
                        primoInserimetoCommessa:false}); 

                    const newState = {
                        inserisciModificaCommessa:'NO_ACTION',
                        datiFatturazione:mainState.datiFatturazione,
                        primoInserimetoCommessa:false
                    };
                    const statusApp = localStorage.getItem('statusApplication')||'{}';
                    const parseStatusApp = JSON.parse(statusApp);
            
                    localStorage.setItem('statusApplication',JSON.stringify({...parseStatusApp,
                        ...newState}));
                   
                    navigate('/4');
                }
    
            }).catch((err) =>{
                manageError(err, navigate);
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
                        {valueSelect !== '' ? 
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
                            : null}
                    </Box>
                </div>

                {(mainState.primoInserimetoCommessa && profilo.auth === 'SELFCARE') &&
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

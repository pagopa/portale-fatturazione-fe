import React, {useState, useEffect, useContext} from 'react';
import { manageError, redirect } from '../../api/api';
import { Button, Box, Typography, FormControl, InputLabel,Select, MenuItem, Skeleton, Container,} from '@mui/material';
import GridComponent from '../../components/commessaElenco/grid';
import { useLocation, useNavigate } from 'react-router';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { GlobalContext } from '../../store/context/globalContext';
import { profiliEnti } from '../../reusableFunction/actionLocalStorage';
import { DataGridCommessa, GetAnniResponse, ResponseGetListaCommesse } from '../../types/typeModuloCommessaElenco';
import { getDatiFatturazione } from '../../api/apiSelfcare/datiDiFatturazioneSE/api';
import { getAnni, getListaCommessaFiltered, getDatiModuloCommessa, getListaCommessaFilteredV2, getCommessaObbligatoriVerificaV2 } from '../../api/apiSelfcare/moduloCommessaSE/api';
import ModalRedirect from '../../components/commessaInserimento/madalRedirect';
import { fixResponseForDataGrid } from '../../reusableFunction/function';
import { PathPf } from '../../types/enum';
import { ManageErrorResponse } from '../../types/typesGeneral';
import GridCustom from '../../components/reusableComponents/grid/gridCustom';
import { headerNameModComTrimestraleENTE } from '../../assets/configurations/conf_GridModComEnte';


const ModuloCommessaElencoUtPa: React.FC = () => {

    const globalContextObj = useContext(GlobalContext);
    const {dispatchMainState, mainState , openBasicModal_DatFat_ModCom} = globalContextObj;

    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;
    const navigate = useNavigate();
    const location = useLocation();
  

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
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totDoc,setTotDoc] = useState(0);
    const [loadingMandatory, setLoadingMandatory] = useState(true);
    const [showButtonInsertModulo,setShowButtonInsertModulo] = useState(false);

    useEffect(()=>{
        if(mainState.datiFatturazione === false || mainState.datiFatturazioneNotCompleted){
            setOpenModalRedirect(true);
        }else{
            getAnniSelect();
            getListaCommessaGrid('');
            verificaObbligatoriToInsert();
        }
    },[mainState.datiFatturazione,mainState.datiFatturazioneNotCompleted]);




    const verificaObbligatoriToInsert = async() => {
        await getCommessaObbligatoriVerificaV2(token, profilo.nonce).then((res)=>{
            const redirect =  localStorage.getItem('redirectToInsert')||"";
            const redirectToInsert =  JSON.parse(redirect);
            console.log({redirectToInsert});
            if(res.data && redirectToInsert){
                navigate(PathPf.MODULOCOMMESSA);
            }else{
                localStorage.setItem('redirectToInsert',JSON.stringify(false));
                setLoadingMandatory(false);
            }
            setShowButtonInsertModulo(res.data);
        }).catch((err)=>{
            manageError(err,dispatchMainState);
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
        await getListaCommessaFilteredV2(token , profilo.nonce,valueAnno).then((res:ResponseGetListaCommesse)=>{
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
        //cliccando sulla side nav Modulo commessa e sono un ente qualsiasi
        navigate(PathPf.MODULOCOMMESSA);
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

    const handleClickOnDetail = () => {
        console.log("click on detail");
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
                        {showButtonInsertModulo &&
                <Button  sx={{ marginTop: 'auto', marginBottom: 'auto', marginLeft: '30px' }} variant="contained" onClick={()=>{
                    handleListItemClickModuloCommessa();
                }}>Inserisci modulo commessa</Button>
                        }
                    </div>
                    <div className='mb-5'>
                        <Typography variant="caption-semibold">N.B. il Modulo Commessa per le previsioni dei consumi deve essere inserito dal giorno 1 al giorno 15 di ogni mese</Typography>
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
                            headerNames={headerNameModComTrimestraleENTE}
                            apiGet={handleClickOnDetail}
                            disabled={false}
                            headerAction={headerAction}
                            body={valueSelect}
                            widthCustomSize="auto"></GridCustom>
                
                    </div>
                    <ModalRedirect 
                        setOpen={setOpenModalRedirect}
                        open={openModalRedirect}
                        sentence={`Per poter inserire il modulo commessa è obbligatorio fornire  i seguenti dati di fatturazione:`}></ModalRedirect>
                </div>
            }
        </>
    );
};
export default  ModuloCommessaElencoUtPa;



import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { Autocomplete, Checkbox, FormControl, InputLabel, MenuItem, Select, TextField} from '@mui/material';
import { SetStateAction, useContext, useEffect, useState } from 'react';
import { GlobalContext } from '../../store/context/globalContext';
import CloseIcon from '@mui/icons-material/Close';
import { ElementMultiSelect, OptionMultiselectChackbox } from '../../types/typeReportDettaglio';
import { listaEntiNotifichePage } from '../../api/apiSelfcare/notificheSE/api';
import { manageError, managePresaInCarico } from '../../api/api';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { getAnniWhiteAdd, getMesiWhiteAdd, getTipologiaFatturaWhite, whiteListAdd } from '../../api/apiPagoPa/whiteListPA/whiteList';

const style = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 800,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius:'20px'
};

interface ModalAggiungiProps {
    open:boolean,
    setOpen:React.Dispatch<SetStateAction<boolean>>,
    getLista:any
}

interface Bodyadd {
    mesi: number[]
    anno: number|null,
    tipologiaFattura: string|null,
    idEnte: string|null
}

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const ModalAggiungi : React.FC<ModalAggiungiProps> = ({open,setOpen,getLista}) => {

    const globalContextObj = useContext(GlobalContext);
    const {mainState,dispatchMainState} = globalContextObj;
    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;

    const [valueAutocomplete, setValueAutocomplete] = useState<{idEnte:string,descrizione:string}|null>();
    const [dataSelect, setDataSelect] = useState<ElementMultiSelect[]>([]);
    const [textValue, setTextValue] = useState('');
    const [valueMotiselectMonths, setValueMultiMonths] = useState<{descrizione:string,mese:number}[]>([]);
    const [tipologiaFatture, setTipologiaFatture] = useState<string[]>([]);
    const [arrayYears,setArrayYears] = useState<number[]>([]);
    const [arrayMonths,setArrayMonths] = useState<{descrizione:string,mese:number}[]>([]);
    const [bodyAdd, setBodyAdd] = useState<Bodyadd>({
        mesi: [],
        anno: null,
        tipologiaFattura: null,
        idEnte: null,
    });

    useEffect(()=>{
        getListTipologiaFattura();
        setBodyAdd({
            mesi: [],
            anno: null,
            tipologiaFattura: null,
            idEnte: null,
        });
        setValueMultiMonths([]);
        setArrayMonths([]);
        setValueAutocomplete(null);
    },[]);

    useEffect(()=>{
        if(bodyAdd.idEnte === null){
            setBodyAdd({
                mesi: [],
                anno: null,
                tipologiaFattura: null,
                idEnte: null,
            });
            setValueMultiMonths([]);
            setArrayMonths([]);
        }
    },[bodyAdd.idEnte]);

    useEffect(()=>{
        if(bodyAdd.tipologiaFattura !== null){
            getAnni(bodyAdd.tipologiaFattura, bodyAdd.idEnte);
            setBodyAdd((prev) => ({...prev,...{ mesi:[],anno: null,}}));
            setValueMultiMonths([]);
            setArrayMonths([]);
        }
    },[bodyAdd.tipologiaFattura]);

    useEffect(()=>{
        if(bodyAdd.anno !== null){
            getMesi(bodyAdd.tipologiaFattura, bodyAdd.idEnte, bodyAdd.anno);
        }
    },[bodyAdd.anno]);


    useEffect(()=>{
        const timer = setTimeout(() => {
            if(textValue.length >= 3){ 
                listaEntiPageOnSelect();
            }
        }, 800);
        return () => clearTimeout(timer);
    },[textValue]);
        
    const listaEntiPageOnSelect = async () =>{
        await listaEntiNotifichePage(token, profilo.nonce, {descrizione:textValue} )
            .then((res)=>{
                setDataSelect(res.data);
            }).catch(((err)=>{
                manageError(err,dispatchMainState);
            }));
    };

    const getListTipologiaFattura = async() => {
        await getTipologiaFatturaWhite(token, profilo.nonce).then((res)=>{
            setTipologiaFatture(res.data);
        }).catch(((err)=>{
            setTipologiaFatture([]);
            manageError(err,dispatchMainState);
        }));   
    };

    const getAnni = async(tipologiaFattura,idEnte) => {
        await getAnniWhiteAdd(token, profilo.nonce,{tipologiaFattura:tipologiaFattura,idEnte:idEnte}).then((res)=>{
            setArrayYears(res.data);
        }).catch(((err)=>{
            manageError(err,dispatchMainState);
        }));   

    };

    const getMesi = async(tipologiaFattura,idEnte,anno) => {
        await getMesiWhiteAdd(token, profilo.nonce,{tipologiaFattura:tipologiaFattura, idEnte:idEnte,anno:anno}).then((res)=>{
            setArrayMonths(res.data);
            setValueMultiMonths([]);
        }).catch(((err)=>{
            manageError(err,dispatchMainState);
        }));   
    };
  
   
    const onButtonOK = async(body) => {
        await whiteListAdd(token, profilo.nonce, body).then((res)=>{
            managePresaInCarico('CAMBIO_TIPOLOGIA_CONTRATTO',dispatchMainState);
            setOpen(false);
            getLista();
            clearPopUp();
        }).catch((err)=>{
            setOpen(false);
            manageError(err,dispatchMainState);
            clearPopUp();
        });
    };


    const clearPopUp = () => {
        setBodyAdd({
            mesi: [],
            anno: null,
            tipologiaFattura: null,
            idEnte: null,
        });
        setValueMultiMonths([]);
        setValueAutocomplete(null);
    };


    return (
        <div>
            <Modal
                open={open}
            >
                <Box sx={style}>
                    <div className='d-flex justify-content-between'>
                        <div className='d-flex align-items-center justify-content-start'>
                            <Typography  id="modal-modal-title" variant="h6" component="h2">
                              Inserisci gli enti nella lista
                            </Typography>
                        </div>
                        <div className="d-flex align-items-center justify-content-end">
                            <div className='icon_close'>
                                <CloseIcon onClick={() =>{ setOpen(false); clearPopUp();}} id='close_icon' sx={{color:'#17324D'}}></CloseIcon>
                            </div>
                        </div>
                    </div>
                    <div className="row mb-5 mt-5" >
                        <div  className="col-6">
                            <Autocomplete
                                onChange={(event, value) => {
                                    setBodyAdd((prev:any) => ({...prev,...{idEnte:value?.idEnte||null}}));
                                    console.log(value);
                                    setValueAutocomplete(value||null);
                                }}
                                options={dataSelect}
                                disableCloseOnSelect
                                getOptionLabel={(option:OptionMultiselectChackbox) => (option.descrizione)}
                                value={valueAutocomplete}
                                isOptionEqualToValue={(option, value) => option.idEnte === value.idEnte}
                                renderOption={(props, option) =>{
                                    const newProps = {...props,...{key:option.idEnte}};
                                    return (
                                        <li {...newProps}   >
                                            {option.descrizione||''}
                                        </li>
                                    );
                                } }
                                renderInput={(params) =>{
                                    return <TextField 
                                        onChange={(e)=> setTextValue(e.target.value)} 
                                        {...params}
                                        label="Rag Soc. Ente" 
                                        placeholder="Min 3 caratteri" />;
                                }}
                            />
                        </div>
                        <div className='col-6'>
                            <FormControl
                                fullWidth
                                size="medium"
                            >
                                <InputLabel>
                                Tipologia Fattura  
                                </InputLabel>
                                <Select
                                    label='Tipologia Fattura'
                                    disabled={bodyAdd.idEnte === null}
                                    onChange={(e) => setBodyAdd((prev:any) => ({...prev,...{tipologiaFattura:e.target.value}}))}     
                                    value={bodyAdd.tipologiaFattura||''}       
                                >
                                    {tipologiaFatture.map((el) =>{ 
                                        return (            
                                            <MenuItem
                                                key={Math.random()}
                                                value={el}
                                            >
                                                {el}
                                            </MenuItem>              
                                        );
                                    } )}   
                                </Select>
                            </FormControl>
                        </div>
                    </div>
                    <div className="row mb-5 mt-5" >
                        <div className="col-6">
                            <Box >
                                <FormControl
                                    fullWidth
                                    size="medium"
                                >
                                    <InputLabel>
                            Anno   
                                    </InputLabel>
                                    <Select
                                        label='Seleziona Anno'
                                        disabled={bodyAdd.tipologiaFattura === null}
                                        onChange={(e) => {
                                            const value = Number(e.target.value);
                                            setBodyAdd((prev)=> ({...prev, ...{anno:value}}));
                                        }}
                                        value={bodyAdd.anno||''}     
                                    >
                                        {arrayYears.map((el) => (
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
                        </div>
                        <div className="col-6">
                            <Autocomplete
                                limitTags={1}
                                multiple
                                disabled={bodyAdd.tipologiaFattura === null || bodyAdd.anno === null}
                                onChange={(event, value) => {
                                    const valueArray = value.map((el) => Number(el.mese));
                                    setValueMultiMonths(value);
                                    setBodyAdd((prev) => ({...prev,...{mesi:valueArray}}));
                                }}
                                options={arrayMonths}
                                value={valueMotiselectMonths}
                                disableCloseOnSelect
                                getOptionLabel={(option) => option.descrizione}
                                renderOption={(props, option,{ selected }) =>(
                                    <li {...props}>
                                        <Checkbox
                                            icon={icon}
                                            checkedIcon={checkedIcon}
                                            style={{ marginRight: 8 }}
                                            checked={selected}
                                        />
                                        {option.descrizione}
                                    </li>
                                )}
                                renderInput={(params) => {
                                    return <TextField {...params}
                                        label="Mesi" 
                                        placeholder="Mesi" />;
                                }}     
                            />
                        </div>
                    </div>
                    <div className='container_buttons_modal d-flex justify-content-center mt-5'>
                        <Button  
                            disabled={bodyAdd.anno === null || bodyAdd.mesi.length === 0 || bodyAdd.anno === null}
                            variant='contained'
                            onClick={()=> onButtonOK(bodyAdd)}
                        >Aggiungi</Button>
                    </div>
                </Box>
            </Modal>
        </div>
    );
};
export default  ModalAggiungi;
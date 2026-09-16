import * as React from 'react';
import Box from '@mui/material/Box';
import { Button, CircularProgress } from '@mui/material';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { SetStateAction, useEffect, useRef, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { ElementMultiSelect } from '../../../types/typeReportDettaglio';
import { listaEntiNotifichePage } from '../../../api/apiSelfcare/notificheSE/api';
import { manageError, managePresaInCarico } from '../../../api/api';
import Loader from '../loader';
import { useGlobalStore } from '../../../store/context/useGlobalStore';
import MainFilter from '../mainFilter';
import { gestioneFattureInserisci, gestioneFattureVerificaNotaPii, getAnniGestioneFattureAzione, getMesiGestioneFattureAzione } from '../../../api/apiPagoPa/gestioneFatturePA/api';
import { formatDate } from '../../../reusableFunction/function';
import { month as NOMI_MESI} from '../../../reusableFunction/reusableArrayObj';

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

export interface ModalAggiungiProps {
  open:{
      open:boolean,
      sentence:React.ReactNode|string,
      buttonIsVisible?:boolean|null,
      loaderIsVisible?:boolean,
      sentenceLoader?:string,
      labelButton?:string,
      actionButton?:()=>void,icon?:React.ElementType
      },
  setOpen:React.Dispatch<SetStateAction<any>>,
  getLista:any
}

interface BodyAction {
  mese: number[]
  anno: number|null,
  tipologiaFattura: string|null,
  idEnte: string|null,
  azione:string|null,
  nota: {
    "data": string,
    "testo": string
  }|null
}

const inputPropsObj = {
  xs: 12,
  sm: 12,
  md: 6,
  lg: 6
};


const ModalAggiungi : React.FC<ModalAggiungiProps> = ({open,setOpen,getLista}) => {
  
  const mainState = useGlobalStore(state => state.mainState);
  const dispatchMainState = useGlobalStore(state => state.dispatchMainState);
  
  
  const token =  mainState.profilo.jwt;
  const profilo =  mainState.profilo;
  const exceptionId = import.meta.env.VITE_ACTION_EXCEPTION_ENTE_ID;
  
  const [valueAutocomplete, setValueAutocomplete] = useState<{descrizione:string,idEnte:string}|null>(null);
  const [dataSelect, setDataSelect] = useState<ElementMultiSelect[]>([]);
  const [textValue, setTextValue] = useState('');
  // const [valueMotiselectMonths, setValueMultiMonths] = useState<{descrizione:string,mese:number}[]>([]);
  const [tipologiaFatture, setTipologiaFatture] = useState<string[]>([]);
  const [arrayYears,setArrayYears] = useState<number[]>([]);
  const [arrayMonths,setArrayMonths] = useState<{descrizione:string,mese:number}[]>([]);
  const [showLoader, setShowLoader] = useState(false);
  const [textAreaValuePii, setTextAreaValuePii] = useState<string>('');
  const textNoteVerified = useRef(false);

  const azioni = ["Posticipa","Elimina"];
  
  const [bodyAction, setBodyAction] = useState<BodyAction>({
    mese: [],
    anno: null,
    tipologiaFattura: null,
    idEnte: null,
    azione:null,
    nota:null
  });

  function generaRangeAnnoMese() {
    const oggi = new Date();
    const annoCorrente = oggi.getFullYear();
    const meseCorrente = oggi.getMonth() + 1;

    let annoInizio = annoCorrente;
    let meseInizio = meseCorrente - 2;

    if (meseInizio <= 0) {
      meseInizio += 12;
      annoInizio -= 1;
    }

    const annoFine = annoCorrente + 1;
    const meseFine = 12;

    const result:{anno:number,mese:{mese:number,descrizione:string}}[] = [];
    let anno = annoInizio;
    let mese = meseInizio;
    while (anno < annoFine || (anno === annoFine && mese <= meseFine)) {
      result.push({
        anno,
        mese: {
          mese,
          descrizione: NOMI_MESI[mese - 1] 
        }
      });
      mese++;
      if (mese > 12) {
        mese = 1;
        anno++;
      }
    }
    return result;
  }

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
        setDataSelect([]);
        manageError(err,dispatchMainState);
      }));
  };
  
  
  const getAnni = async(tipologiaFattura,azione) => {
    await getAnniGestioneFattureAzione(token, profilo.nonce,{tipologiaFattura:tipologiaFattura,azione:azione}).then((res)=>{
      setArrayYears(res.data);
    }).catch(((err)=>{
      setArrayYears([]);
      manageError(err,dispatchMainState);
    }));   
  };
  
  const getMesi = async(tipologiaFattura,azione,anno) => {
    await getMesiGestioneFattureAzione(token, profilo.nonce,{tipologiaFattura:tipologiaFattura, azione:azione,anno:anno.toString()}).then((res)=>{
      setArrayMonths(res.data);
    }).catch(((err)=>{
      setArrayMonths([]);
      manageError(err,dispatchMainState);
    }));   
  };
  
  
  const actionInserisci = async(body) => {
    setShowLoader(true);
    const newBody ={...body,mese:body.mese[0].toString(),anno:body.anno.toString(),idFattura:null};
    await gestioneFattureInserisci(token, profilo.nonce, newBody).then(()=>{
      managePresaInCarico('INSER_DELETE_WHITE_LIST',dispatchMainState);
      setShowLoader(false);
      setOpen(false);
      getLista(body.anno);
      clearPopUp();
      textNoteVerified.current = false;
    }).catch((err)=>{
      setShowLoader(false);
      setOpen(false);
      manageError(err,dispatchMainState);
      clearPopUp();
      textNoteVerified.current = false;
    });
  };

  const verificaTestoNota = async (): Promise<void> => {
    setOpen((prev)=> ({...prev,loaderIsVisible:true,sentenceLoader:"Verifica della NOTA in corso ..."}));
    try {
      const response = await gestioneFattureVerificaNotaPii(
        token,
        profilo.nonce,
        { testo: bodyAction.nota?.testo||'' }
      );
      const responseVerifica = response.data as {redactedString:string};

      setBodyAction((prev)=>({...prev,nota:{ testo:responseVerifica?.redactedString||'',data:formatDate(new Date())}}));
      setTextAreaValuePii(bodyAction.nota?.testo||"");
      
    } catch (err: unknown) {
      console.log({ err });
    } finally {
      setOpen((prev)=> ({...prev,loaderIsVisible:false,sentenceLoader:null}));
      console.log("ciao");
      textNoteVerified.current = true;
    }
  };
  
  const clearPopUp = () => {
    setBodyAction({
      mese: [],
      anno: null,
      tipologiaFattura: null,
      idEnte:null,
      azione:null,
      nota:null
    });
    // setValueMultiMonths([]);
    setValueAutocomplete(null);
    setArrayMonths([]);
    setDataSelect([]);
    setTextValue('');
    setTextAreaValuePii("");
    textNoteVerified.current = false;
  };

  const regex = /^(?=.{15,500}$)(\S+\s+){2,}\S+$/;

  function isValidText(str) {
    return regex.test(str.trim());
  }

  function isValidText2(str: string): boolean {
    const trimmed = str.trim();
    if (!trimmed) return false;

    const words = trimmed.match(/[A-Za-zÀ-ÖØ-öø-ÿ]+/g) || [];
    return words.length >= 3;
  }


  const setTextAreaValueClearPii = (e) => {
    if(textNoteVerified.current){
      textNoteVerified.current = false;
      setBodyAction((prev)=>({...prev,nota:{testo:textAreaValuePii,data:''}}));
      setOpen((prev)=> ({...prev,sentenceLoader:"Prosegui"}));
    }else{
      setTextAreaValuePii('');
      setBodyAction((prev)=> ({...prev, ...{nota:{
        "data": formatDate(new Date()),
        "testo": e
      }}}));  
    }
  };
  
  const disableBotton = (bodyAction.anno === null 
  || bodyAction.mese.length === 0 
  || bodyAction.tipologiaFattura === null
  ||(bodyAction.nota?.testo && bodyAction.nota.testo.length < 10)
  || bodyAction.nota === null 
  || !isValidText(bodyAction.nota.testo||"") 
  || open.loaderIsVisible )? true : false;

  return (
    <div>
      <Modal open={open.open}>
        <Box sx={style}>
          <div className='d-flex justify-content-between'>
            <div className='d-flex align-items-center justify-content-start'>
              <Typography  id="modal-modal-title" variant="h6" component="h2">
    Inserisci gli enti nella lista
              </Typography>
            </div>
            <div className="d-flex align-items-center justify-content-end">
              <div className='icon_close'>
                <CloseIcon onClick={() =>{ setOpen((prev)=>({...prev.open,open:false})); clearPopUp();}} id='close_icon' sx={{color:'#17324D'}}></CloseIcon>
              </div>
            </div>
          </div>
          <Box sx={{display:"flex", gap:1,mt:2}}>
            <MainFilter
              itemProps={inputPropsObj} 
              filterName={"select_value_string"}
              inputLabel={"Azione"}
              clearOnChangeFilter={()=> null}
              setBody={setBodyAction}
              body={bodyAction}
              keyDescription={"azione"}
              keyValue={"azione"}
              keyBody={"azione"}
              arrayValues={azioni}
              defaultValue={""}
              extraCodeOnChange={(e)=>{
                setBodyAction((prev)=> ({...prev, ...{azione:e,tipologiaFattura:null,anno:null,mese:[],nota:null}}));
                setValueAutocomplete(null);
                setTextValue('');
              }}
            />
            <MainFilter 
              disabled={bodyAction.azione === null}
              itemProps={inputPropsObj}
              filterName={"multi_checkbox-single-selection"}
              inputLabel={"Rag. Sociale"}
              clearOnChangeFilter={()=> null}
              setBody={setBodyAction}
              valueAutocompleteSingle={valueAutocomplete}
              setValueAutocompleteSingle={setValueAutocomplete}
              body={bodyAction}
              keyValue={"idEnte"}
              keyDescription='descrizione'
              keyOption={'idEnte'}
              arrayValues={dataSelect}
              keyBody={"idEnte"}
              dataSelect={dataSelect}
              setTextValue={setTextValue}
              textValue={textValue}
              extraCodeOnChangeObject={(value) => {
                const newIdEnte = value ? value.idEnte : [];

                setBodyAction((prev: any) => ({
                  ...prev,
                  idEnte: newIdEnte,
                  tipologiaFattura: null,
                  anno: null,
                  mese: [],
                  nota:null
                }));

                setValueAutocomplete(value || null);

                if (bodyAction.azione === "Elimina" && newIdEnte !== exceptionId) {
                  setTipologiaFatture(["ANTICIPO", "ACCONTO"]);
                } else if (
                  bodyAction.azione === "Elimina" && newIdEnte === exceptionId
                ) {
                  setTipologiaFatture([
                    "ANTICIPO",
                    "ACCONTO",
                    "PRIMO SALDO"
                  ]);
                } else if (bodyAction.azione === "Posticipa") {
                  setTipologiaFatture([
                    "PRIMO SALDO",
                    "SECONDO SALDO",
                    "VAR. SEMESTRALE",
                    "SEM. SOSPESI"
                  ]);
                }
              }}
            />
          </Box>
          <Box sx={{display:"flex", gap:1,mt:2}}>
            <MainFilter 
              disabled={bodyAction.idEnte === null}
              itemProps={inputPropsObj}
              filterName={"select_value_string"}
              defaultValue={""}
              inputLabel={"Tipologia Fattura"}
              clearOnChangeFilter={()=> null}
              setBody={setBodyAction}
              body={bodyAction}
              keyDescription={"tipologiaFattura"}
              keyValue={"tipologiaFattura"}
              keyBody={"tipologiaFattura"}
              arrayValues={tipologiaFatture}
              extraCodeOnChange={(e)=>{
                setBodyAction((prev)=> ({...prev, ...{tipologiaFattura:e,anno:null,mese:[],nota:null}}));
                if(bodyAction.idEnte === exceptionId && e === "PRIMO SALDO"){
                  const exeptionAnniMesi = generaRangeAnnoMese();
                  const newArray:number[] = Array.from(new Set(exeptionAnniMesi.map(el => el.anno))).reverse();
                  setArrayYears(newArray);
                }else{
                  getAnni(e, bodyAction.azione);
                }
              }} />
            <MainFilter 
              disabled={bodyAction.tipologiaFattura === null}
              itemProps={inputPropsObj}
              filterName={"select_value_string"}
              defaultValue={""}
              inputLabel={"Anno"}
              clearOnChangeFilter={()=> null}
              setBody={setBodyAction}
              body={bodyAction}
              keyDescription={"anno"}
              keyValue={"anno"}
              keyBody={"anno"}
              arrayValues={arrayYears}
              extraCodeOnChange={(e)=>{   
                setBodyAction((prev)=> ({...prev, ...{anno:Number(e),mese:[],nota:null}}));
                if(bodyAction.idEnte === exceptionId &&  bodyAction.tipologiaFattura === "PRIMO SALDO"){
                  const exeptionAnniMesi = generaRangeAnnoMese();
                  const newArrayMonth = exeptionAnniMesi.filter(el => Number(el.anno) === Number(e)).map(el => {
                    el.mese  = {mese:el.mese.mese,descrizione:el.mese.descrizione.toUpperCase()};
                    return el.mese;
                  }).reverse();
                  setArrayMonths(newArrayMonth);
                }else{
                  getMesi(bodyAction.tipologiaFattura,bodyAction.azione,e);
                }
              }} 
            />
          </Box>
          <Box sx={{display:"flex", gap:1, mt:2}}>
            <MainFilter 
              itemProps={ inputPropsObj}
              filterName={"select_key_value"}
              defaultValue={""}
              inputLabel={"Mese"}
              disabled={bodyAction.anno === null}
              clearOnChangeFilter={()=> null}
              setBody={setBodyAction}
              body={bodyAction}
              keyValue={"mese"}
              keyDescription='descrizione'
              keyBody={"mese"}
              arrayValues={arrayMonths}
              extraCodeOnChange={(e)=>{
                const value = Number(e);
                setBodyAction((prev)=> ({...prev, ...{mese:[value],nota:null}}));             
              }}
            />
            <MainFilter 
              disabled={bodyAction.mese.length === 0}
              itemProps={inputPropsObj}
              filterName={"text-area"}
              inputLabel={"Nota"}
              clearOnChangeFilter={()=> null}
              setBody={setBodyAction}
              body={bodyAction}
              keyValue={"nota"}
              keyDescription={"nota"}
              keyBody={"nota"}
              error={(!isValidText2(bodyAction.nota?.testo||"") || !isValidText(bodyAction.nota?.testo||""))&& bodyAction.mese.length !== 0}
              extraCodeOnChange={(e)=>{
                setTextAreaValueClearPii(e);
              }}
              helperText={(bodyAction.nota?.testo?.length||0) > 500 ?
                `Inserisci una nota (max ${500} caratteri). Non inserire dati sensibili né informazioni riconducibili a persone o fatti specifici.`
                : `Inserisci una nota (min ${10} max ${500} caratteri). Non inserire dati sensibili né informazioni riconducibili a persone o fatti specifici.`}
              placeHolder={"Non inserire dati sensibili né informazioni riconducibili a persone o fatti specifici."}
            />
          </Box>
          {!showLoader ?
            <div className='container_buttons_modal d-flex justify-content-center mt-5'>
              <Button 
                startIcon={open?.loaderIsVisible ? <CircularProgress size={16} color="inherit" /> : null}
                disabled={disableBotton}
                variant="contained" 
                sx={{
                  width: open.sentenceLoader ? 250 : 120,
                  flexShrink: 0,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: 'inline-flex'
                }}
                onClick={() => {
                  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
                  textNoteVerified.current ? actionInserisci(bodyAction): verificaTestoNota();
                }}
              >
                {open.sentenceLoader ? open.sentenceLoader : "Inserisci"}
              </Button> 
            </div>:
            <div id='loader_on_modal' className='container_buttons_modal d-flex justify-content-center mt-5'>
              <Loader sentence={textNoteVerified.current ?'Attendere':'Verifica della nota in corso'}></Loader> 
            </div>}
        </Box>
      </Modal>
    </div>
  );
};
export default  ModalAggiungi;
import React, {useState, useRef, useEffect} from 'react';
import {TextField,} from '@mui/material';
import {DatiFatturazione, TextFieldProps, StateEnableConferma}  from '../../types/typesAreaPersonaleUtenteEnte';
import { _YupPec} from '../../validations/email/index';
import YupString from '../../validations/string/index';
import { getValidationCodiceSdi } from '../../api/apiPagoPa/datiDiFatturazionePA/api';

import { getValidationCodiceSdiEnte } from '../../api/apiSelfcare/datiDiFatturazioneSE/api';
import { useGlobalStore } from '../../store/context/useGlobalStore';



const TextFieldComponent : React.FC<TextFieldProps> = props => {

    const setOpenModalInfo = useGlobalStore(state => state.setOpenModalInfo);
    
    const {
        helperText,
        label,
        placeholder,
        fullWidth,
        value,
        keyObject,
        dataValidation,
        required,
        mainState,
        setDatiFatturazione,
        setStatusButtonConferma,
        datiFatturazione,
        setOpenModalVerifica
    } = props;
    
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const [errorValidation, setErrorValidation] = useState(false);

    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;

    useEffect(()=>{
        if(mainState.statusPageDatiFatturazione === "mutable"){
            if(keyObject === "codiceSDI"){
                validationSDI(dataValidation.max, dataValidation.validation, (datiFatturazione.codiceSDI||""), true);
            }else{
                hendleOnMouseOut();
            }  
        }
    },[mainState.statusPageDatiFatturazione]);

  

  
    useEffect(()=>{

        if(keyObject === 'cup' && datiFatturazione.cup === '' && (datiFatturazione.idDocumento !== '' ||  (datiFatturazione.dataDocumento !== null && datiFatturazione.dataDocumento !== "") ) && mainState.statusPageDatiFatturazione === "mutable" && datiFatturazione.tipoCommessa !== ""){
            setErrorValidation(true);
            setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{[label]:true}}) );
        }else if(keyObject === 'cup' && datiFatturazione.cup === '' && (datiFatturazione.idDocumento === '' ||  (datiFatturazione.dataDocumento === null || datiFatturazione.dataDocumento === "")) && mainState.statusPageDatiFatturazione === "mutable" && datiFatturazione.tipoCommessa !== ""){
            setErrorValidation(false);
            setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{[label]:false}}) );
        }else  if(keyObject === 'idDocumento' && datiFatturazione.idDocumento === '' && (datiFatturazione.cup !== '' ||  (datiFatturazione.dataDocumento !== null && datiFatturazione.dataDocumento !== "")) && mainState.statusPageDatiFatturazione === "mutable" && datiFatturazione.tipoCommessa !== ""){
            setErrorValidation(true);
            setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{[label]:true}}) );
        }else if(keyObject === 'idDocumento' && datiFatturazione.idDocumento === '' && (datiFatturazione.cup === '' ||  (datiFatturazione.dataDocumento === null || datiFatturazione.dataDocumento === ""))  && mainState.statusPageDatiFatturazione === "mutable" && datiFatturazione.tipoCommessa !== ""){
            setErrorValidation(false);
            setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{[label]:false}}) );
        }
    },[datiFatturazione.cup,datiFatturazione.idDocumento,datiFatturazione.dataDocumento]);

    /*commentato il 01/10/25 spostata la logica sull'onchange
   
*/
    //logica aggiunta pe lo SDI 19/11 start

    const sdiIsValid = async(newSdi,isFirstRender=false) =>{
        if(profilo.auth === 'PAGOPA'){
            await getValidationCodiceSdi(token,profilo.nonce,{idEnte:profilo.idEnte,codiceSDI:isFirstRender?datiFatturazione.codiceSDI:newSdi})
                .then(()=>{
                    setOpenModalVerifica && setOpenModalVerifica(false);
                    setErrorValidation(false);
                    setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{[label]:false}}) );
                }).catch((err)=>{
                    if(!isFirstRender){
                        setOpenModalVerifica && setOpenModalVerifica(false);
                        setOpenModalInfo({open:true,sentence:err.response.data.detail});
                    }
                    setErrorValidation(true);
                    setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{[label]:true}}) );
                });
        }else{
            await getValidationCodiceSdiEnte(token,profilo.nonce,{codiceSDI:isFirstRender?datiFatturazione.codiceSDI:newSdi})
                .then(()=>{
                    setOpenModalVerifica && setOpenModalVerifica(false);
                    setErrorValidation(false);
                    setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{[label]:false}}) );
                }).catch((err)=>{
                    if(!isFirstRender){
                        setOpenModalVerifica && setOpenModalVerifica(false);
                        setOpenModalInfo({open:true,sentence:err.response.data.detail});
                    }
                    setErrorValidation(true);
                    setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{[label]:true}}) );
                });
        }
    };
    const validationTextArea = (max: number, validation:string, input:string|number)=>{
        YupString.max(max, validation).matches(/^[a-zA-Z0-9]*$/,  {
            message: "Non è possibile inserire caratteri speciali",
            excludeEmptyString: true
        }).validate(input)
            .then(()=>{
                if(keyObject === 'cup' && datiFatturazione.idDocumento === '' && input !== ''){
                    setErrorValidation(false);
                    setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{"ID Documento":true,[label]:false}}) );
                }else if(keyObject === 'cup' && datiFatturazione.idDocumento !== '' && input === ''){
                    setErrorValidation(true);
                    setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{"ID Documento":false,[label]:true}}) );
                }else if(keyObject === 'cup' && datiFatturazione.idDocumento === '' && input === ''){
                    setErrorValidation(false);
                    setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{"ID Documento":false,[label]:false}}) );
                }else{
                    //forse da eliminare
                    setErrorValidation(false);
                    setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{[label]:false}}) );
                }
            }).catch(() =>{
                if(keyObject === 'cup' && datiFatturazione.idDocumento === '' && input !== ''){
                    setErrorValidation(true);
                    setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{"ID Documento":true,[label]:true}}) );
                }else if(keyObject === 'cup' && datiFatturazione.idDocumento !== '' && input !== ''){
                    setErrorValidation(true);
                    setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{"ID Documento":false,[label]:true}}) );
                }else if(keyObject === 'cup' && datiFatturazione.idDocumento === '' && input === ''){
                    //probabilmente if da eliminare
                    setErrorValidation(true);
                    setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{"ID Documento":false,[label]:true}}) );
                }else{
                    setErrorValidation(true);
                    setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{[label]:true}}) );
                }
              
            } );
    }; 


    const validationIdDocumento = (max: number, validation:string, input:string|number) => {
        YupString.max(max, validation).matches(/^[a-zA-Z0-9/._\-\s]*$/,  {
            message: "Non è possibile inserire caratteri speciali"
        }).validate(input)
            .then(()=>{
                if(keyObject === 'idDocumento' && datiFatturazione.cup === '' && input !== ''){
                    setErrorValidation(false);
                    setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{"CUP":true,[label]:false}}) );
                }else if(keyObject === 'idDocumento' && datiFatturazione.cup !== '' && input === ''){
                    setErrorValidation(true);
                    setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{"CUP":false,[label]:true}}) );
                }else if(keyObject === 'idDocumento' && datiFatturazione.cup === '' && input === ''){
                    setErrorValidation(false);
                    setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{"CUP":false,[label]:false}}) );
                }else{
                    setErrorValidation(false);
                    setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{[label]:false}}) );
                }
                
            }).catch(() =>{
                if(keyObject === 'idDocumento' && datiFatturazione.cup === '' && input !== ''){
                    setErrorValidation(true);
                    setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{"CUP":true,[label]:true}}) );
                }else if(keyObject === 'idDocumento' && datiFatturazione.cup !== '' && input !== ''){
                    setErrorValidation(true);
                    setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{"CUP":false,[label]:true}}) );
                }else if(keyObject === 'idDocumento' && datiFatturazione.cup === '' && input === ''){
                    //probabilmente if da eliminare
                    setErrorValidation(true);
                    setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{"CUP":false,[label]:true}}) );
                }else{
                    setErrorValidation(true);
                    setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{[label]:true}}) );
                }
             
            } );
    };

    const validationSDI = (max: number, validation:string, input:string|number,isFirstRender)=>{
        YupString.max(max, validation).matches(/^[A-Z0-9]*$/,  {
            message: "Non è possibile inserire caratteri speciali"
        }).required().validate(input)
            .then(()=>{
                sdiIsValid(input,isFirstRender); 
            }).catch(() =>{
                setErrorValidation(true);
                if(!isFirstRender){
                    setOpenModalVerifica && setOpenModalVerifica(false);
                }
                setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{[label]:true}}) );
            } );
    }; 
    
    const validationTextAreaEmail = (element:string)=>{
        _YupPec.validate(element)
            .then(()=>{
                setErrorValidation(false);
                setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{[label]:false}}) );
            })
            .catch(()=> {
                setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{[label]:true}}) );
                setErrorValidation(true);
            } );
    }; 
    
  
    const validationCodCommessa = (max: number, validation:string, input:string|number) => {
        YupString.max(max, validation).matches(/^[a-zA-Z0-9/._\-\s]*$/,  {
            message: "Non è possibile inserire caratteri speciali"
        }).validate(input).then(()=>{
            setErrorValidation(false);
            setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{[label]:false}}) );
        }).catch(() =>{
            setErrorValidation(true);
            setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{[label]:true}}) );
        } );
    };
    
    // a fine refactoring cambiare nome alla funzione
    const hendleOnMouseOut = (e?: React.ChangeEvent<HTMLInputElement>) =>{
        e?.persist();
        if(e === undefined){
            if(keyObject === 'pec'){
                validationTextAreaEmail(datiFatturazione.pec);
            }else if(keyObject ==='idDocumento'){
              
                validationIdDocumento(dataValidation.max,dataValidation.validation ,datiFatturazione.idDocumento);
            }else if(keyObject === 'codCommessa'){
                validationCodCommessa(dataValidation.max,dataValidation.validation ,datiFatturazione.codCommessa);
            }else if(keyObject === 'cup'){
                validationTextArea(dataValidation.max,dataValidation.validation ,datiFatturazione.cup);
            }
        }else{
            if(keyObject === 'pec'){
                validationTextAreaEmail(e?.target.value);
            }else if(keyObject ==='idDocumento'){
                validationIdDocumento(dataValidation.max,dataValidation.validation ,e?.target.value);
            }else if(keyObject === 'codCommessa'){
                validationCodCommessa(dataValidation.max,dataValidation.validation ,e?.target.value);
            }else if(keyObject === 'cup'){
                validationTextArea(dataValidation.max,dataValidation.validation ,e?.target.value);
            }
        }
       
        /*  secondo me da eliminare
        if(keyObject ==='idDocumento' && datiFatturazione.idDocumento === '' && datiFatturazione.cup !== ''){
            setErrorValidation(true);
        }
        */
    };
    
    let makeTextInputDisable = true;
    if(mainState.statusPageDatiFatturazione === 'immutable'){
        makeTextInputDisable = true;
    }else if(mainState.statusPageDatiFatturazione === 'mutable' && datiFatturazione.tipoCommessa === ''){
        makeTextInputDisable = true;
    }else if(mainState.statusPageDatiFatturazione === 'mutable' && datiFatturazione.tipoCommessa !== ''){
        makeTextInputDisable = false;
    }

    let maxChar = 0;

    if(keyObject === 'cup'){
        maxChar = 15;
    }else if(keyObject ==='idDocumento'){
        maxChar = 20;
    }else if(keyObject === 'codCommessa'){
        maxChar = 100;
    }else if(keyObject === "codiceSDI"){
        maxChar = 7;
    }else if(keyObject === "pec"){
        maxChar = 100;
    }
  
    return (
        <TextField
            required={required}
            helperText={helperText}
            label={label}
            placeholder={placeholder}
            fullWidth={fullWidth}
            disabled={makeTextInputDisable}
            value={value}
            autoComplete='off'
            inputProps={{ maxLength: maxChar }} 
            error={errorValidation && datiFatturazione.tipoCommessa !== ""}
            onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{
                let val = e.target.value;
                if(keyObject === "codiceSDI"){
                    val = val.toUpperCase();
                }
             
                if (debounceRef.current) {
                    clearTimeout(debounceRef.current);
                }

                if (keyObject === "codiceSDI" && mainState.statusPageDatiFatturazione === 'mutable' && datiFatturazione.tipoCommessa !== "") {
                    setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{"Codice univoco o SDI":true}}) );
                    debounceRef.current = setTimeout(() => {
                        setOpenModalVerifica &&  setOpenModalVerifica(true);
                        validationSDI(dataValidation.max, dataValidation.validation, val,false);
                    }, 1500);
                }
       
                hendleOnMouseOut(e);
              
                setDatiFatturazione((prevState: DatiFatturazione) =>{
                    const newValue = {[keyObject]:val};
                    const newState = {...prevState, ...newValue};
                    return newState;
                } );
                
            }}
        />
   
       
    );
};

export default TextFieldComponent;

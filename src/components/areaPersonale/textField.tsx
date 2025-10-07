import React, {useState, useContext, useRef, useEffect} from 'react';
import {TextField,} from '@mui/material';
import {DatiFatturazione, TextFieldProps, StateEnableConferma}  from '../../types/typesAreaPersonaleUtenteEnte';
import { _YupPec} from '../../validations/email/index';
import YupString from '../../validations/string/index';
import { getValidationCodiceSdi } from '../../api/apiPagoPa/datiDiFatturazionePA/api';
import { GlobalContext } from '../../store/context/globalContext';
import { getValidationCodiceSdiEnte } from '../../api/apiSelfcare/datiDiFatturazioneSE/api';



const TextFieldComponent : React.FC<TextFieldProps> = props => {

    const globalContextObj = useContext(GlobalContext);
    const {
        setOpenModalInfo
    } = globalContextObj;

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
        //datiFatturazione.codiceSDI !== null &&
        if(mainState.statusPageDatiFatturazione === "mutable"){
            if(keyObject === "codiceSDI"){
                validationSDI(dataValidation.max, dataValidation.validation, (datiFatturazione.codiceSDI||""), true);
            }else{
                hendleOnMouseOut();
                /*
                if(((keyObject === "cup" && datiFatturazione.cup !== "")  || (keyObject === "codCommessa"&& datiFatturazione.codCommessa !== "")) && datiFatturazione.idDocumento === ""){
                    setDatiFatturazione((prevState: DatiFatturazione) =>{
                        const newValue = {idDocumento:"--"};
                        const newState = {...prevState, ...newValue};
                        return newState;
                    } );
                }*/
            }
            
        }
    },[mainState.statusPageDatiFatturazione]);
    
    useEffect(()=>{
        
        if(keyObject === 'idDocumento' && datiFatturazione.idDocumento === '' && (datiFatturazione.cup !== '' || datiFatturazione.codCommessa !== "" && mainState.statusPageDatiFatturazione === "mutable" && datiFatturazione.tipoCommessa !== "") ){
            setErrorValidation(true);
            setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{[label]:true}}) );
        }else if(keyObject === 'idDocumento' && datiFatturazione.idDocumento === '' && datiFatturazione.cup === '' && datiFatturazione.codCommessa === ""&& mainState.statusPageDatiFatturazione === "mutable" && datiFatturazione.tipoCommessa !== ""){
            setErrorValidation(false);
            setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{[label]:false}}) );
        }
    },[datiFatturazione.cup,datiFatturazione.codCommessa]);

    /*commentato il 01/10/25 spostata la logica sull'onchange
   
*/
    //logica aggiunta pe lo SDI 19/11 start

    const sdiIsValid = async(newSdi,isFirstRender=false) =>{
        if(profilo.auth === 'PAGOPA'){
            await getValidationCodiceSdi(token,profilo.nonce,{idEnte:profilo.idEnte,codiceSDI:isFirstRender?datiFatturazione.codiceSDI:newSdi})
                .then((res)=>{
             
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
                .then((res)=>{
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
                /*if(keyObject === 'cup' && datiFatturazione.idDocumento === '' && input !== ''){
                    setErrorValidation(false);
                    setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{"ID Documento":true,[label]:false}}) );
                }else{
                    setErrorValidation(false);
                    setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{[label]:false}}) );
                }*/
                setErrorValidation(false);
                setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{[label]:false}}) );
            }).catch(() =>{
                /*if(keyObject === 'cup' && datiFatturazione.idDocumento === '' && input !== ''){
                    setErrorValidation(true);
                    setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{"ID Documento":true,[label]:true}}) );
                }else{
                    setErrorValidation(true);
                    setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{[label]:true}}) );
                }*/
                setErrorValidation(true);
                setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{[label]:true}}) );
                
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
    
    const validationIdDocumento = (max: number, validation:string, input:string|number) => {
        YupString.max(max, validation).matches(/^[a-zA-Z0-9/._\-\s]*$/,  {
            message: "Non è possibile inserire caratteri speciali"
        }).validate(input).then(()=>{
            if( ((datiFatturazione.cup !== ""  || datiFatturazione.codCommessa !== "") && input === "")){
                setErrorValidation(true);
                setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{[label]:true}}) );
            }else{
                setErrorValidation(false);
                setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{[label]:false}}) );
            }
            
        }).catch(() =>{
            setErrorValidation(true);
            setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{[label]:true}}) );
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
                /* if(((keyObject === "cup" && e.target.value !== "")  || (keyObject === "codCommessa"&& e.target.value !== "")) && datiFatturazione.idDocumento === ""){
                    setDatiFatturazione((prevState: DatiFatturazione) =>{
                        const newValue = {[keyObject]:val};
                        const newState = {...prevState, ...newValue};
                        return newState;
                    } );
                }else if(
                    ((keyObject === "cup" && e.target.value === "" && datiFatturazione.codCommessa === "")  ||
                     (keyObject === "codCommessa" && e.target.value === "" && datiFatturazione.cup === "")) &&
                      datiFatturazione.idDocumento === "--"){
                    setDatiFatturazione((prevState: DatiFatturazione) =>{
                        const newValue = {[keyObject]:val};
                        const newState = {...prevState, ...newValue};
                        return newState;
                    } );
                }else{}*/
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

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
    
    const [errorValidation, setErrorValidation] = useState(false);

    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;


    useEffect(()=>{
        
        if(datiFatturazione.codiceSDI !== null && keyObject === "codiceSDI"){
            validationSDI(dataValidation.max, dataValidation.validation, datiFatturazione.codiceSDI, true);
        }

    },[]);
    

    /*commentato il 01/10/25 spostata la logica sull'onchange
    useEffect(()=>{
        
        if(keyObject === 'idDocumento' && datiFatturazione.idDocumento === '' && datiFatturazione.cup !== ''){
            setErrorValidation(true);
            setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{[label]:true}}) );
        }else if(keyObject === 'idDocumento' && datiFatturazione.idDocumento === '' && datiFatturazione.cup === ''){
            setErrorValidation(false);
            setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{[label]:false}}) );
        }
        
    },[datiFatturazione.cup]);
*/
    //logica aggiunta pe lo SDI 19/11 start

    const sdiIsValid = async(isFirstRender=false) =>{
        if(profilo.auth === 'PAGOPA'){
            await getValidationCodiceSdi(token,profilo.nonce,{idEnte:profilo.idEnte,codiceSDI:datiFatturazione.codiceSDI})
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
            await getValidationCodiceSdiEnte(token,profilo.nonce,{codiceSDI:datiFatturazione.codiceSDI})
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
    } ;

    /*commentato il 01/10/25 spostata la logica sull'onchange
 
    useEffect(()=>{
        if(keyObject === 'codiceSDI' && mainState.statusPageDatiFatturazione === 'mutable' && mainState.datiFatturazione){
            validationSDI(dataValidation.max,dataValidation.validation ,value);
        }
    },[mainState.statusPageDatiFatturazione]);

    */
    //logica aggiunta pe lo SDI 19/11 end
    
    
    const validationTextArea = (max: number, validation:string, input:string|number)=>{
        
        YupString.max(max, validation).matches(/^[a-zA-Z0-9]*$/,  {
            message: "Non è possibile inserire caratteri speciali",
            excludeEmptyString: true
        }).validate(input)
            .then(()=>{
                console.log({CUP_FUN:input,keyObject,input},true);
                if(keyObject === 'cup' && datiFatturazione.idDocumento === '' && input !== ''){
                    setErrorValidation(false);
                    setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{"ID Documento":true,[label]:false}}) );
                }else{
                    setErrorValidation(false);
                    setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{[label]:false}}) );
                }
                
            }).catch(() =>{
                console.log({CUP_FUN:input,keyObject,input},false);
                if(keyObject === 'cup' && datiFatturazione.idDocumento === '' && input !== ''){
                    setErrorValidation(true);
                    setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{"ID Documento":true,[label]:true}}) );
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
                console.log("EEEEEEEEEE");
                sdiIsValid(isFirstRender); 
            }).catch(() =>{
                setErrorValidation(true);
                if(!isFirstRender){
                    setOpenModalVerifica && setOpenModalVerifica(false);
                }
                console.log("UUUUUUUU");
                setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{[label]:true}}) );
            } );
    }; 
    
    const validationTextAreaEmail = (element:string)=>{
        console.log({element});
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
            console.log("zorro");
            setErrorValidation(false);
            setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{[label]:false}}) );
        }).catch(() =>{
            console.log("zorro 2");
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
    const hendleOnMouseOut = (e: React.ChangeEvent<HTMLInputElement>) =>{
        e.persist();
        if(keyObject === 'pec'){
            console.log(1);
            validationTextAreaEmail(e.target.value);
        }else if(keyObject ==='idDocumento'){
           
            console.log(4);
            validationIdDocumento(dataValidation.max,dataValidation.validation ,e.target.value);
          
           
        }else if(keyObject === 'codCommessa'){
            console.log(6);
            validationCodCommessa(dataValidation.max,dataValidation.validation ,e.target.value);
        }else if(keyObject === 'cup'){
            validationTextArea(dataValidation.max,dataValidation.validation ,e.target.value);
        }
        

        if(keyObject ==='idDocumento' && datiFatturazione.idDocumento === '' && datiFatturazione.cup !== ''){
            console.log();
            setErrorValidation(true);
        }

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
    }

    const debounceRef = useRef<NodeJS.Timeout | null>(null);
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
            error={(keyObject === "idDocumento" &&  datiFatturazione.idDocumento === '' && datiFatturazione.cup !== '') ? true : errorValidation}
            onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{
                console.log({onchange:e.target.value});

                let val = e.target.value;
                if(keyObject === "codiceSDI"){
                    val = val.toUpperCase();
                }
                console.log(val);
                // Reset debounce timer
                if (debounceRef.current) {
                    clearTimeout(debounceRef.current);
                }

                // Start new timer for 2 seconds
                if (keyObject === "codiceSDI" && mainState.statusPageDatiFatturazione === 'mutable' && datiFatturazione.tipoCommessa !== "") {
                    console.log("cciciicicicic");
                    setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{"Codice univoco o SDI":true}}) );
                    debounceRef.current = setTimeout(() => {
                        console.log("debounce");
                        setOpenModalVerifica &&  setOpenModalVerifica(true);
                        
                        validationSDI(dataValidation.max, dataValidation.validation, val,false);
                    }, 1500);
                }
                //setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{[label]:true}}) );
                hendleOnMouseOut(e);
                setDatiFatturazione((prevState: DatiFatturazione) =>{
                   
                    const newValue = {[keyObject]:val};
                    const newState = {...prevState, ...newValue};
                    return newState;
                } );}}
        />
   
       
    );
};

export default TextFieldComponent;

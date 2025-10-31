import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {DataProps, StateEnableConferma}  from '../../types/typesAreaPersonaleUtenteEnte';
import { it } from "date-fns/locale";
import { useEffect, useState } from 'react';

export interface DatePickerProps {
    label: string;
  
    className?: string;
    disabled?: boolean;
    error?: string | boolean;
    onChange?: (v: string) => void;
    name?: string;
    value?: string | number | Date;
    min_date?: string | number | Date;
    max_date?: string | number | Date;
    placeholder?: string;
    autocomplete: "birthday";
}

const DataComponent : React.FC<DataProps> = ({ dataLabel ,  formatDate,mainState,setDatiFatturazione, datiFatturazione,setStatusButtonConferma}) => {

    const [error,setError] = useState(false);
  
    const onChangeHandler = (e) => {
      
        if(e?.toString() === "Invalid Date"){
            if(datiFatturazione.idDocumento !== null && datiFatturazione.idDocumento !== ""){
                setDatiFatturazione({...datiFatturazione,...{dataDocumento:null}});
                setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, dataDocumento:true}) );
                setError(true);
            }else{
                setDatiFatturazione({...datiFatturazione,...{dataDocumento:null}});
                setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, dataDocumento:false}) );
                setError(false);
            }
            
        }else{
            try {
                if (e) {
                    const year = e.getFullYear();
             
                    if (year < 2000 || year > 2125 || (datiFatturazione.idDocumento && e === null) ) {
                        setError(true);
                        setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, dataDocumento:true}) );
                 
                        return;
                    }else{
                        const data: Date = new Date(e);
                        setDatiFatturazione({...datiFatturazione,...{dataDocumento:data}});
                        setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, dataDocumento:false}) );
                        setError(false);
                    }
                }else if(e === null && datiFatturazione.idDocumento !== null && datiFatturazione.idDocumento !== ""){
                    setDatiFatturazione({...datiFatturazione,...{dataDocumento:null}});
                    setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, dataDocumento:true}) );
                    setError(true);
                  
                }else if(e === null && datiFatturazione.idDocumento === null || datiFatturazione.idDocumento === ""){
                    setDatiFatturazione({...datiFatturazione,...{dataDocumento:null}});
                    setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, dataDocumento:false}) );
                    setError(false);
                  
                }
           
            } catch (error) { 
                setDatiFatturazione({...datiFatturazione,...{dataDocumento:''}});
                setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{dataDocumento:true}}) );
                setError(true);
              
            }
        }
       
    };

    useEffect(()=>{
        if(datiFatturazione.dataDocumento !== null && datiFatturazione.dataDocumento !== '' && datiFatturazione.dataDocumento !== null ){
            onChangeHandler(new Date(datiFatturazione.dataDocumento));
        }else{
            onChangeHandler(datiFatturazione.dataDocumento);
        } 
    },[datiFatturazione.idDocumento]);

    let valueDate:Date|null = null;
    if(datiFatturazione.dataDocumento === ""){
        valueDate = null;
    }else if(datiFatturazione.dataDocumento){
        valueDate = new Date(datiFatturazione.dataDocumento);
    }
   
    let dataInputDisable  = true;

    if(mainState.statusPageDatiFatturazione === 'immutable'){
        dataInputDisable = true;
    }else if(mainState.statusPageDatiFatturazione === 'mutable' && datiFatturazione.tipoCommessa === ''){
        dataInputDisable = true;
    }else if(mainState.statusPageDatiFatturazione === 'mutable' && datiFatturazione.tipoCommessa !== ''){
        dataInputDisable = false;
    }
 
    return (
        <div>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={it}>
                <DesktopDatePicker
                    label={dataLabel}
                    format={formatDate}
                    value={valueDate}
                    onChange={(e:Date | null)  => {
                        onChangeHandler(e);}}
                    disabled={dataInputDisable}
                    slotProps={{
                        textField: {
                            required: datiFatturazione.idDocumento !== null && datiFatturazione.idDocumento !== "",
                            error:  (error||((datiFatturazione.idDocumento !== "" && datiFatturazione.idDocumento !== null) && datiFatturazione.dataDocumento === null ) )&& mainState.statusPageDatiFatturazione === 'mutable' && datiFatturazione.tipoCommessa !== "",
                            inputProps: {
                                placeholder: 'dd/MM/yyyy',
                            },
                        },
                    }}
                />
            </LocalizationProvider>
        </div>
    );
};

export default DataComponent;
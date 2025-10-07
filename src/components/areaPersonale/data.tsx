import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {DataProps, StateEnableConferma}  from '../../types/typesAreaPersonaleUtenteEnte';
import { it } from "date-fns/locale";
import { useState } from 'react';

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
    
        try {
            if (e) {
                const year = e.getFullYear();
            
                if (year < 2023 || year > 2100) {
                    setError(true);
                    return;
                }else{
                    const data: string = new Date(e).toISOString();
                 
                    setDatiFatturazione({...datiFatturazione,...{dataDocumento:data}});
                    setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, dataDocumento:false}) );
                    setError(false);
                }
            }
           
        } catch (error) {
            setDatiFatturazione({...datiFatturazione,...{dataDocumento:''}});
            setStatusButtonConferma((prev:StateEnableConferma) =>({...prev, ...{dataDocumento:true}}) );
            setError(true);
        }
    };

    let valueDate:Date|null = null;
    if(datiFatturazione.dataDocumento){
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
                    onChange={(e:Date | null)  => onChangeHandler(e)}
                    disabled={dataInputDisable}
                    slotProps={{
                        textField: {
                            required: true,
                            error: (valueDate === null || error) && mainState.statusPageDatiFatturazione === 'mutable' && datiFatturazione.tipoCommessa !== "",
                            inputProps: {
                                placeholder: 'dd/mm/aaaa',
                            },
                        },
                    }}
                />
            </LocalizationProvider>
        </div>
    );
};

export default DataComponent;
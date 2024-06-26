import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {DataProps}  from '../../types/typesAreaPersonaleUtenteEnte';

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

const DataComponent : React.FC<DataProps> = ({ dataLabel ,  formatDate,mainState,setDatiFatturazione, datiFatturazione}) => {

 
    const onChangeHandler = (e) => {
        
        try {
            const data: string = new Date(e).toISOString();
            setDatiFatturazione({...datiFatturazione,...{dataDocumento:data}});
        } catch (error) {
            setDatiFatturazione({...datiFatturazione,...{dataDocumento:''}});
        }
    };

    let valueDate = new Date();
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
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DesktopDatePicker
                    label={dataLabel}
                    format={formatDate}
                    value={valueDate}
                    onChange={(e:Date | null)  => onChangeHandler(e)}
                    disabled={dataInputDisable}
                    slotProps={{
                        textField: {
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
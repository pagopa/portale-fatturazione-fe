import React, {useContext} from "react";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {DataProps, AreaPersonaleContext}  from '../types/typesAreaPersonaleUtenteEnte';
import { DatiFatturazioneContext } from '../page/areaPersonaleUtenteEnte';




const DataComponent : React.FC<DataProps> = ({ dataLabel ,  formatDate}) => {

    const {infoModuloCommessa,setDatiFatturazione, datiFatturazione} = useContext<AreaPersonaleContext>(DatiFatturazioneContext);

  

    const onChangeHandler = (e: any) => {
        console.log(e === null);

        try {
            const data = new Date(e).toISOString();
            setDatiFatturazione({...datiFatturazione,...{dataDocumento:data}});
        } catch (error) {
            setDatiFatturazione({...datiFatturazione,...{dataDocumento:null}});
        }
    };

    let valueDate = null;
    if(datiFatturazione.dataDocumento){
        valueDate = new Date(datiFatturazione.dataDocumento);
    }
  

    let dataInputDisable  = true;

  
    if(infoModuloCommessa.statusPageDatiFatturazione === 'immutable'){
        dataInputDisable = true;
    }else if(infoModuloCommessa.statusPageDatiFatturazione === 'mutable' && datiFatturazione.tipoCommessa === ''){
        dataInputDisable = true;
    }else if(infoModuloCommessa.statusPageDatiFatturazione === 'mutable' && datiFatturazione.tipoCommessa !== ''){
        dataInputDisable = false;

    }
 
    return (
        <div>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DesktopDatePicker
                    label={dataLabel}
                    format={formatDate}
                    value={valueDate}
                    onChange={(e) => onChangeHandler(e)}
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
import React from "react";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {DataProps}  from '../types/typesAreaPersonaleUtenteEnte';




const DataComponent : React.FC<DataProps> = ({ dataLabel ,  formatDate, status, children, data, setData }) => {

    let preventError = new Date();
    if(children){
        preventError = new Date(children);
    }

    const onChangeHandler = (_date: Date | null) => {
        if (_date) {
            setData(_date);
        }
    };
 
    return (
        <div>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DesktopDatePicker
                    label={dataLabel}
                    format={formatDate}
                    value={preventError|| data}
                    onChange={onChangeHandler}
                    disabled={status=== 'immutable' ? true : false}
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
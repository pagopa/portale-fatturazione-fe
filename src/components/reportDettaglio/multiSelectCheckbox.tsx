import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { manageError } from '../../api/api';
import { useNavigate } from 'react-router';
import { MultiselectNotificheProps, OptionMultiselectChackbox } from '../../types/typeReportDettaglio';
import {useState, useEffect } from 'react';
import { BodyListaNotifiche} from '../../types/typesGeneral';
import { listaEntiNotifichePage, listaEntiNotifichePageConsolidatore } from '../../api/apiSelfcare/notificheSE/api';
import { getProfilo, getToken } from '../../reusableFunction/actionLocalStorage';

const MultiselectCheckbox : React.FC <MultiselectNotificheProps> = ({setBodyGetLista, dataSelect, setDataSelect,mainState,setTextValue, textValue ,valueAutocomplete, setValueAutocomplete,dispatchMainState}) => {

    const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
    const checkedIcon = <CheckBoxIcon fontSize="small" />;

    const token =  getToken();
    const profilo =  getProfilo();

    useEffect(()=>{
        if(dataSelect.length === 0){
            setValueAutocomplete([]);
        }
    }, [dataSelect]);
   
    useEffect(()=>{
        const timer = setTimeout(() => {
            if(textValue.length >= 3){
                listaEntiNotifichePageOnSelect();
            }
        }, 800);
        return () => clearTimeout(timer);
    },[textValue]);

    // servizio che popola la select con la checkbox
    const listaEntiNotifichePageOnSelect = async () =>{
        if(profilo.profilo === 'CON'){
            await listaEntiNotifichePageConsolidatore(token, mainState.nonce, {descrizione:textValue} )
                .then((res)=>{
                    setDataSelect(res.data);
                })
                .catch(((err)=>{
                    manageError(err,dispatchMainState);
                }));
        }else if(profilo.auth === 'PAGOPA'){
            await listaEntiNotifichePage(token, mainState.nonce, {descrizione:textValue} )
                .then((res)=>{
                    setDataSelect(res.data);
                })
                .catch(((err)=>{
                    manageError(err,dispatchMainState);
                }));
        }
    };
    return (
        <Autocomplete
            multiple
            onChange={(event, value) => {
                const arrayIdEnte = value.map(obj=> obj.idEnte);
                setBodyGetLista((prev:BodyListaNotifiche) => ({...prev,...{idEnti:arrayIdEnte}}));
                setValueAutocomplete(value);
            }}
            id="checkboxes-tags-demo"
            options={dataSelect}
            disableCloseOnSelect
            getOptionLabel={(option:OptionMultiselectChackbox) => (option.descrizione)}
            value={valueAutocomplete}
            isOptionEqualToValue={(option, value) => option.idEnte === value.idEnte}
            renderOption={(props, option, { selected }) =>{
                const newProps = {...props,...{key:option.idEnte}};
                return (
                    <li {...newProps}   >
                        <Checkbox
                            icon={icon}
                            checkedIcon={checkedIcon}
                            style={{ marginRight: 8 }}
                            checked={selected}
                        />
                        {option.descrizione}
                    </li>
                );
            } }
            style={{ width: '80%' }}
            renderInput={(params) =>{
                return <TextField 
                    onChange={(e)=> setTextValue(e.target.value)} 
                    {...params}
                    label="Rag Soc. Ente" 
                    placeholder="Min 3 caratteri" />;
            }}
        />
    );
};
export default MultiselectCheckbox;

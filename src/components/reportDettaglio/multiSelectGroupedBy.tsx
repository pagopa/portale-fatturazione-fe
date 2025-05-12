import * as React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { Checkbox } from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { manageError } from '../../api/api';
import { FlagContestazione, MultiSelectGroupedByProps } from '../../types/typeReportDettaglio';
import { useEffect , useState} from 'react';
import { BodyListaNotifiche} from '../../types/typesGeneral';
import { flagContestazione } from '../../api/apiSelfcare/notificheSE/api';


const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const MultiSelectStatoContestazione : React.FC<MultiSelectGroupedByProps> =  ({ setBodyGetLista, setValueFgContestazione, valueFgContestazione, dispatchMainState,mainState,clearOnChangeFilter}) => {


    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;


    const [fgContestazione, setFgContestazione] = useState<FlagContestazione[]>([]);

    useEffect(()=>{
       
        getFlagContestazione();
        
    },[]);

    const getFlagContestazione =  async() => {
        await flagContestazione(token, profilo.nonce )
            .then((res)=>{
                setFgContestazione(res.data);                
            })
            .catch(((err)=>{
                manageError(err,dispatchMainState);
            }));
    };

    return (
        <Autocomplete
            limitTags={1}
            multiple
            onChange={(event, value) => {
                const arrayIdContestazioni = value.map(obj=> obj.id);
                setValueFgContestazione(value);
                setBodyGetLista((prev:BodyListaNotifiche) => ({...prev,...{statoContestazione:arrayIdContestazioni}}));
                clearOnChangeFilter();
                
            }}
            value={valueFgContestazione}
            id="contestazioneNotifiche"
            options={fgContestazione}
            groupBy={(option:FlagContestazione) => option.descrizione}
            disableCloseOnSelect
            getOptionLabel={(option) => option.flag}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) =>{
               
                return <TextField 
                    sx={{backgroundColor:"#F2F2F2"}}
                    {...params}
                    label="Contestazione" 
                    placeholder="Contestazione" />;
            } 
                
            }
            style={{height:'59px'}}
            renderOption={(props, option, { selected }) =>{
                const newProps = {...props,...{key:option.id}};
                return (
                    <div>
                        <li {...newProps}>
                            <Checkbox
                                icon={icon}
                                checkedIcon={checkedIcon}
                                style={{ marginRight: 8 }}
                                checked={selected}
                            />
                            {option.flag}
                        </li>
                    </div>
                );
            } }
        />
    );
};
export default MultiSelectStatoContestazione;

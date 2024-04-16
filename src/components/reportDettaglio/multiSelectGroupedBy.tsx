import * as React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { Checkbox } from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { manageError } from '../../api/api';
import { useNavigate } from 'react-router';
import { FlagContestazione, MultiSelectGroupedByProps } from '../../types/typeReportDettaglio';
import { useEffect , useState} from 'react';
import { BodyListaNotifiche } from '../../types/typesGeneral';
import { flagContestazione } from '../../api/apiSelfcare/notificheSE/api';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const MultiSelectStatoContestazione : React.FC<MultiSelectGroupedByProps> =  ({mainState,  setBodyGetLista, setValueFgContestazione, valueFgContestazione}) => {

    const getToken = localStorage.getItem('token') || '{}';
    const token =  JSON.parse(getToken).token;

    const getProfilo = localStorage.getItem('profilo') || '{}';
    const profilo =  JSON.parse(getProfilo);
 
    const navigate = useNavigate();

    const [fgContestazione, setFgContestazione] = useState<FlagContestazione[]>([]);

    const getFlagContestazione =  async() => {
        await flagContestazione(token, mainState.nonce )
            .then((res)=>{
                setFgContestazione(res.data);
                                
            })
            .catch(((err)=>{
                manageError(err,navigate);
            }));
    };

    useEffect(()=>{
        if(mainState.nonce !== ''){
            getFlagContestazione();
            
        }
    },[mainState.nonce]);

    return (
        <Autocomplete
            sx={{ '.MuiAutocomplete-groupLabel': {
                backgroundColor:'#FF0000',
                       
            },
            height:'60px'}}
            multiple
            onChange={(event, value) => {
                const arrayIdContestazioni = value.map(obj=> obj.id);
                setValueFgContestazione(value);
                setBodyGetLista((prev:BodyListaNotifiche) => ({...prev,...{statoContestazione:arrayIdContestazioni}}));
                
            }}
            value={valueFgContestazione}
            id="contestazioneNotifiche"
            options={fgContestazione}
            groupBy={(option:FlagContestazione) => option.descrizione}
            disableCloseOnSelect
            getOptionLabel={(option) => option.flag}
            onInputChange={(event, newInputValue, reason)=>console.log('')}
            renderInput={(params) =>{
               
                return <TextField 
                    //onChange={(e)=> setTextValue(e.target.value)} 
                  
                    {...params}
                    label="Contestazione" 
                    placeholder="Contestazione" />;
            } 
                
            }
            renderOption={(props, option, { selected }) =>{
                //settato come key l'id ente 
              
                const newProps = {...props,...{key:option.id}};
                return (
                    <div>
                        <li    {...newProps}   >
                        
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

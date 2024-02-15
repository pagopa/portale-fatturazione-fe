import * as React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { Checkbox } from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { flagContestazione, manageError } from '../../api/api';
import { useNavigate } from 'react-router';
import { FlagContestazione, MultiSelectGroupedByProps } from '../../types/typeReportDettaglio';
import { useEffect , useState} from 'react';
import { BodyListaNotifiche } from '../../types/typesGeneral';


const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const MultiSelectStatoContestazione : React.FC<MultiSelectGroupedByProps> =  ({mainState,  setBodyGetLista, setValueFgContestazione, valueFgContestazione}) => {

    const getToken = localStorage.getItem('token') || '{}';
    const token =  JSON.parse(getToken).token;
 
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
            multiple
            onChange={(event, value) => {
                const arrayIdContestazioni = value.map(obj=> obj.id);
                setValueFgContestazione(value);
                setBodyGetLista((prev:BodyListaNotifiche) => ({...prev,...{statoContestazione:arrayIdContestazioni}}));
                
            }}
            value={valueFgContestazione}
            id="grouped-demo"
            options={fgContestazione}
            groupBy={(option:FlagContestazione) => option.descrizione}
            disableCloseOnSelect
            getOptionLabel={(option) => option.flag}
            onInputChange={(event, newInputValue, reason)=>console.log({event, newInputValue, reason}, '??')}
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
                    <li {...newProps}   >
                        
                        <Checkbox
                            
                            icon={icon}
                            checkedIcon={checkedIcon}
                            style={{ marginRight: 8 }}
                            checked={selected}
                        />
                        
                        {option.flag}
                    </li>
                );
            } }
        />
    );
};
export default MultiSelectStatoContestazione;


// Top 100 films as rated by IMDb users. http://www.imdb.com/chart/top
const options = [
    {
        "id": 1,
        "flag": "Non Contestata",
        "descrizione": "Non contestata"
    },
    {
        "id": 2,
        "flag": "Annullata",
        "descrizione": "Anullata"
    },
    {
        "id": 3,
        "flag": "Contestata Ente",
        "descrizione": "Contestazione"
    },
    {
        "id": 4,
        "flag": "Risposta Send",
        "descrizione": "Contestazione"
    },
    {
        "id": 5,
        "flag": "Risposta Recapitista",
        "descrizione": "Contestazione"
    },
    {
        "id": 6,
        "flag": "Risposta Consolidatore",
        "descrizione": "Contestazione"
    },
    {
        "id": 7,
        "flag": "Risposta Ente",
        "descrizione": "Contestazione"
    },
    {
        "id": 8,
        "flag": "Accettata",
        "descrizione": "Risoluzione"
    },
    {
        "id": 9,
        "flag": "Rifiutata",
        "descrizione": "Risoluzione"
    }
];
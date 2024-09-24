import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { MultiselectNotificheProps, OptionMultiselectChackbox } from '../../types/typeReportDettaglio';
import { BodyListaNotifiche} from '../../types/typesGeneral';
import { useLocation } from 'react-router';
import { PathPf } from '../../types/enum';
import { BodyFatturazione } from '../../types/typeFatturazione';
import { BodyDownloadModuliCommessa } from '../../types/typeListaModuliCommessa';
import { BodyRel } from '../../types/typeRel';
import { BodyGetListaDatiFatturazione } from '../../types/typeListaDatiFatturazione';


const MultiselectCheckbox : React.FC <MultiselectNotificheProps> = ({setBodyGetLista, dataSelect,setTextValue,valueAutocomplete, setValueAutocomplete}) => {

    const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
    const checkedIcon = <CheckBoxIcon fontSize="small" />;
    const location = useLocation();

    const customMargin = location.pathname === PathPf.FATTURAZIONE ? { width: '80%' ,marginLeft:'12px'} : { width: '80%'};

   

    return (
        <Autocomplete
            multiple
            onChange={(event, value) => {
                const arrayIdEnte = value.map(obj=> obj.idEnte);
                setBodyGetLista((prev:any) => ({...prev,...{idEnti:arrayIdEnte}}));
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
            style={customMargin}
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

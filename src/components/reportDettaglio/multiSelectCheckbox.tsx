import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { MultiselectNotificheProps, OptionMultiselectChackbox } from '../../types/typeReportDettaglio';

const MultiselectCheckbox : React.FC <MultiselectNotificheProps> = ({setBodyGetLista, dataSelect,setTextValue,valueAutocomplete, setValueAutocomplete,clearOnChangeFilter}) => {

    const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
    const checkedIcon = <CheckBoxIcon fontSize="small" />;


    return (
        <Autocomplete
            sx={{width:'80%'}}
            limitTags={1}
            multiple
            onChange={(event, value) => {
                const arrayIdEnte = value.map(obj=> obj.idEnte);
                setBodyGetLista((prev:any) => ({...prev,...{idEnti:arrayIdEnte}}));
                setValueAutocomplete(value);
                clearOnChangeFilter();
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
                        {option.descrizione||''}
                    </li>
                );
            } }
            renderInput={(params) =>{
                return <TextField 
                    sx={{backgroundColor:"#F2F2F2"}}
                    onChange={(e)=> setTextValue(e.target.value)} 
                    {...params}
                    label="Rag Soc. Ente" 
                    placeholder="Min 3 caratteri" />;
            }}
        />
    );
};
export default MultiselectCheckbox;

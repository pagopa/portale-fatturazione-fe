import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { Autocomplete, Checkbox, TextField } from "@mui/material";
import { AutocompleteMultiselect, MultiselectWithKeyValueProps,  RequestBodyListaAnagraficaPsp } from "../../types/typeAngraficaPsp";
import { useLocation } from "react-router";
import { PathPf } from "../../types/enum";
import { RequestBodyListaDocContabiliPagopa } from '../../types/typeDocumentiContabili';





const MultiselectWithKeyValue : React.FC <MultiselectWithKeyValueProps> = ({setBodyGetLista,setValueAutocomplete,dataSelect,valueAutocomplete,setTextValue,keyId,label,keyArrayName,valueId,clearOnChangeFilter}) => {

    const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
    const checkedIcon = <CheckBoxIcon fontSize="small" />;
    const location = useLocation();

    const customMargin = location.pathname === PathPf.FATTURAZIONE ? { width: '80%', height:'59px'} : { width: '80%'};

   

    return (
        <Autocomplete
            multiple
            limitTags={1}
            disablePortal
            onChange={(event, value:AutocompleteMultiselect[]) => {
                const arrayIds = value.map((obj:AutocompleteMultiselect) => obj[keyId]);
                clearOnChangeFilter();
                setBodyGetLista((prev:RequestBodyListaAnagraficaPsp|RequestBodyListaDocContabiliPagopa) => ({...prev,...{[keyArrayName]:arrayIds}}));
                setValueAutocomplete(value);
            }}
            id={keyId}
            options={dataSelect}
            disableCloseOnSelect
            getOptionLabel={(option:AutocompleteMultiselect) =>{
                return option[valueId];
            } }
            value={valueAutocomplete}
            isOptionEqualToValue={(option, value) => option[keyId] === value[keyId]}
            renderOption={(props, option, { selected }) =>{
                const newProps = {...props,...{key:option[keyId]}};
                return (
                    <li {...newProps}   >
                        <Checkbox
                            icon={icon}
                            checkedIcon={checkedIcon}
                            style={{ marginRight: 8 }}
                            checked={selected}
                        />
                        {option[valueId]}
                    </li>
                );
            } }
            style={customMargin}
            renderInput={(params) =>{
                return <TextField 
                    sx={{backgroundColor:"#F2F2F2"}}
                    onChange={(e)=> setTextValue(e.target.value)} 
                    {...params}
                    label={label} 
                    placeholder="Min 3 caratteri" />;
            }}
        />
    );
};
export default MultiselectWithKeyValue;

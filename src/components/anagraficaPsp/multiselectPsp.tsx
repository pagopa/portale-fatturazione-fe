import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { useLocation } from 'react-router';
import { PathPf } from '../../types/enum';
import { MultiSelectPspProps, OptionMultiselectChackboxPsp } from '../../types/typeAngraficaPsp';



const MultiselectPsp : React.FC <MultiSelectPspProps> = ({setBodyGetLista,setValueAutocomplete,dataSelect,valueAutocomplete,setTextValue}) => {

    const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
    const checkedIcon = <CheckBoxIcon fontSize="small" />;
    const location = useLocation();

    const customMargin = location.pathname === PathPf.FATTURAZIONE ? { width: '80%' ,marginLeft:'12px'} : { width: '80%'};

   

    return (
        <Autocomplete
            multiple
            onChange={(event, value) => {
                const arrayContractId = value.map(obj=> obj.contractId);
                setBodyGetLista((prev:any) => ({...prev,...{contractIds:arrayContractId}}));
                setValueAutocomplete(value);
            }}
            id="psp"
            options={dataSelect}
            disableCloseOnSelect
            getOptionLabel={(option:OptionMultiselectChackboxPsp) => (option.name)}
            value={valueAutocomplete}
            isOptionEqualToValue={(option, value) => option.contractId === value.contractId}
            renderOption={(props, option, { selected }) =>{
                const newProps = {...props,...{key:option.contractId}};
                return (
                    <li {...newProps}   >
                        <Checkbox
                            icon={icon}
                            checkedIcon={checkedIcon}
                            style={{ marginRight: 8 }}
                            checked={selected}
                        />
                        {option.name}
                    </li>
                );
            } }
            style={customMargin}
            renderInput={(params) =>{
                return <TextField 
                    onChange={(e)=> setTextValue(e.target.value)} 
                    {...params}
                    label="Nome PSP" 
                    placeholder="Min 3 caratteri" />;
            }}
        />
    );
};
export default MultiselectPsp;

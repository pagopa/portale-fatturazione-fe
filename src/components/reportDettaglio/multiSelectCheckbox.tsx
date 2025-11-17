import { Autocomplete, Checkbox, TextField } from "@mui/material";
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { Dispatch, SetStateAction } from "react";

interface MultiselectNotificheProps<T> {
    setBodyGetLista: Dispatch<SetStateAction<T>>;
    dataSelect: T[];
    setTextValue: Dispatch<SetStateAction<string>>;
    valueAutocomplete: T[];
    setValueAutocomplete: Dispatch<SetStateAction<T[]>>;
    clearOnChangeFilter: () => void;
    getId: (item: T) => any;
    getLabel: (item: T) => string;
}

export function MultiselectCheckbox<T>({
    setBodyGetLista,
    dataSelect,
    setTextValue,
    valueAutocomplete,
    setValueAutocomplete,
    clearOnChangeFilter,
    getId,
    getLabel
}: MultiselectNotificheProps<T>) {

    const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
    const checkedIcon = <CheckBoxIcon fontSize="small" />;

    return (
        <Autocomplete
            sx={{ width: '80%' }}
            limitTags={1}
            multiple
            disableCloseOnSelect
            options={dataSelect}
            value={valueAutocomplete}
            getOptionLabel={getLabel}
            isOptionEqualToValue={(o, v) => getId(o) === getId(v)}
            onChange={(event, value) => {
                const ids = value.map(getId);
                setBodyGetLista(prev => ({ ...prev, idEnti: ids }));
                setValueAutocomplete(value);
                clearOnChangeFilter();
            }}
            renderOption={(props, option, { selected }) => (
                <li {...props} key={getId(option)}>
                    <Checkbox
                        icon={icon}
                        checkedIcon={checkedIcon}
                        checked={selected}
                        sx={{ mr: 1 }}
                    />
                    {getLabel(option)}
                </li>
            )}
            renderInput={(params) => (
                <TextField
                    {...params}
                    sx={{ backgroundColor: "#F2F2F2" }}
                    label="Rag Soc. Ente"
                    placeholder="Min 3 caratteri"
                    onChange={(e) => setTextValue(e.target.value)}
                />
            )}
        />
    );
}

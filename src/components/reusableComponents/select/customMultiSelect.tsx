import { Autocomplete, Checkbox, TextField } from "@mui/material";
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

export interface MultiSelectProps<T> {
    label: string;
    options: T[];
    value: T[];
    onChange: (value: T[]) => void;
    getLabel: (item: T) => string;
    getId: (item: T) => any;
    placeholder?: string;
    groupBy?: (item: T) => string;
    setTextValue?: (value: string) => void;
    textValue?:string
}

export function MultiSelect<T>({
    label,
    options,
    value,
    onChange,
    getLabel,
    getId,
    placeholder = "Search...",
    groupBy,
    setTextValue,
    textValue
}: MultiSelectProps<T>) {


    const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
    const checkedIcon = <CheckBoxIcon fontSize="small" />;

    return (
        <Autocomplete
            style={{ width: '80%'}}
            multiple
            limitTags={1}
            disableCloseOnSelect
            options={options}
            value={value}
            groupBy={groupBy}
            getOptionLabel={getLabel}
            isOptionEqualToValue={(o, v) => getId(o) === getId(v)}
            onChange={(e, val) => onChange(val)}
            onInputChange={(e, val) => setTextValue && setTextValue(val)}
            renderOption={(props, option, { selected }) => (
                <li {...props} key={getId(option)}>
                    <Checkbox
                        icon={icon}
                        checkedIcon={checkedIcon}
                        sx={{ mr: 1 }}
                        checked={selected}
                    />
                    {getLabel(option)}
                </li>
            )}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={label}
                    placeholder={placeholder}
                    value={textValue||""}
                />
            )}
        />
    );
}

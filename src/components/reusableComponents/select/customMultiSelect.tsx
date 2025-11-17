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
    groupBy?: (item: T) => string;
}

export function MultiSelect<T>({
    label,
    options,
    value,
    onChange,
    getLabel,
    getId,
    groupBy
}: MultiSelectProps<T>) {

    const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
    const checkedIcon = <CheckBoxIcon fontSize="small" />;

    return (
        <Autocomplete
            multiple
            disableCloseOnSelect
            options={options}
            value={value}
            getOptionLabel={getLabel}
            isOptionEqualToValue={(o, v) => getId(o) === getId(v)}
            onChange={(e, val) => onChange(val as T[])}
            groupBy={groupBy}
            renderOption={(props, option, { selected }) => (
                <li {...props} key={getId(option)}>
                    <Checkbox
                        icon={icon}
                        checkedIcon={checkedIcon}
                        checked={selected}
                        style={{ marginRight: 8 }}
                    />
                    {getLabel(option)}
                </li>
            )}
            renderInput={(params) => (
                <TextField {...params} label={label} placeholder={label} />
            )}
        />
    );
}

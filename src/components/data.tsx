import React , { ReactNode } from "react";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';


interface DataProps {
  dataLabel: string,
  formatDate: string,
  status:string
  // any props that come into the component
}

 const DataComponent : React.FC<DataProps> = ({ dataLabel ,  formatDate, status }) => {
  const [value, setValue] = React.useState(new Date());
  const onChangeHandler = (data:any) => {
    setValue(data);
  };
  return (
    <div>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DesktopDatePicker
          label={dataLabel}
          format={formatDate}
          value={value}
          onChange={onChangeHandler}
          disabled={status=== 'immutable' ? true : false}
          slotProps={{
            textField: {
              inputProps: {
                placeholder: 'dd/mm/aaaa',
              },
            },
          }}
        />
      </LocalizationProvider>
    </div>
  );
};

export default DataComponent;
import * as React from 'react';
import { Theme, useTheme } from '@mui/material/styles';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { getProdotti } from '../../reusableFunction/actionLocalStorage';


const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: '200px',
        },
    },
};

const names = [
    'Oliver Hansen',
    'Van Henry',
    'April Tucker',
    'Ralph Hubbard',
    'Omar Alexander',
    'Carlos Abbott',
    'Miriam Wagner',
    'Bradley Wilkerson',
    'Virginia Andrews',
    'Kelly Snyder',
];



export default function MultipleSelectProdotti({setProductSelected}) {

    const prodotti = getProdotti().prodotti;
   
  

    const handleChange = (event) => {
        const {
            target: { value },
        } = event;
        setProductSelected(value);
    };

    return (
        <div className='container_select_prodotti'>
            <FormControl sx={{ marginTop: '20px', width: '430px'}}>
                <InputLabel id="demo-multiple-name-label">Cerca prodotto</InputLabel>
                <Select
                    labelId="demo-multiple-name-label"
                    id="demo-multiple-name"
                    open={true}
                    value={''}
                    onChange={handleChange}
                    input={<OutlinedInput label="Cerca prodotto" />}
                    MenuProps={MenuProps}
                >
                    {prodotti.map((el) => (
                        <MenuItem
                            key={el.jwt}
                            value={el}
                            style={{height:'60px'}}
                        >
                            <div className='icon_select_prodotti'> 
                                <AccountBalanceIcon sx={{color:'#A2ADB8'}} />
                            </div>
                            
                            {el.prodotto}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </div>
    );
}
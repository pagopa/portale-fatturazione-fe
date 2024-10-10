import * as React from 'react';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { getProdotti } from '../../reusableFunction/actionLocalStorage';
import { Typography } from '@mui/material';


const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: '200px',
        },
    },
};





export default function MultipleSelectProdotti({setProductSelected, productSelected}) {

    const prodotti = getProdotti().prodotti;
    const [valueSelect, setValueSelect] = React.useState('');
    const [openSelect, setOpenselect] = React.useState(false);

    React.useEffect(()=>{
        setOpenselect(true);
    },[]);
  
    console.log(valueSelect,'ciao',productSelected);
    const handleChange = (event) => {
        const {
            target: { value },
        } = event;
        setProductSelected(prodotti.find((el) => el.prodotto === value));
        setValueSelect(value);
    };

    

    

    return (
        <div className='container_select_prodotti'>
            <FormControl sx={{ marginTop: '20px', width: '430px'}}>
                <InputLabel id="demo-multiple-name-label">Cerca prodotto</InputLabel>
                <Select
                    labelId="demo-multiple-name-label"
                    id="demo-multiple-name"
                    open={openSelect}
                    value={valueSelect}
                    onChange={(e)=> handleChange(e)}
                    input={<OutlinedInput label="Cerca prodotto" />}
                    MenuProps={MenuProps}
                >
                    {prodotti.map((el) => {

                        let name = el?.prodotto;
                        if(el?.prodotto === 'prod-pagopa'){
                            name = 'pagoPA';
                        }else if(el?.prodotto === 'prod-pn'){
                            name = 'SEND - Servizio Notifiche Digitali';
                        }

                        return (
                            <MenuItem
                                key={el.jwt}
                                value={el.prodotto}
                            >
                                <div className='icon_select_prodotti'> 
                                    <AccountBalanceIcon sx={{color:'#A2ADB8'}} />
                                </div>
        
                                <Typography variant="h6">{name}</Typography> 
                            </MenuItem>
                        );
                    } )}
                </Select>
            </FormControl>
        </div>
    );
}
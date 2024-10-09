import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CloseIcon from '@mui/icons-material/Close';
import { Typography } from '@mui/material';





export default function DivProdotto({productSelected, setProductSelected}) {

    let name = productSelected?.prodotto;
    if(productSelected?.prodotto === 'prod-pagopa'){
        name = 'pagoPA';
    }else if(productSelected?.prodotto === 'prod-pn'){
        name = 'SEND - Servizio Notifiche Digitali';
    }
    

    return (
        <div className='container_div_prodotto'>
            <div className="d-flex align-items-center justify-content-center">
                <div className='icon_select_prodotti'> 
                    <AccountBalanceIcon sx={{color:'#A2ADB8'}} />
                </div>
            </div>
            <div className="d-flex align-items-center justify-content-center">
                <div>
                    <div>
                        <Typography variant="caption-semibold">{name}</Typography>
                    </div>
                    
                    <Typography variant="caption">{productSelected?.descrizioneRuolo}</Typography>
                </div>
            </div>
            <div className="d-flex align-items-center justify-content-center">
                <div className='icon_close'>
                 
                    <CloseIcon onClick={()=>setProductSelected(null)} id='close_icon' sx={{color:'#17324D'}}></CloseIcon>
                
                </div>
                
            </div>
        </div>
    );
}
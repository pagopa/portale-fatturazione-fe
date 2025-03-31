import React, { useContext } from 'react';
import {HeaderProduct, PartyEntity} from '@pagopa/mui-italia';
import { arrayProducts } from '../../assets/dataLayout';
import { GlobalContext } from '../../store/context/globalContext';
import { Badge, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SimCardDownloadIcon from '@mui/icons-material/SimCardDownload';

const HeaderProductEnte : React.FC = () => {
    const globalContextObj = useContext(GlobalContext);
    const {mainState, dispatchMainState,setCountMessages,countMessages } = globalContextObj;
    const profilo =  mainState.profilo;
    const navigate = useNavigate();

    const partyList : Array<PartyEntity> = [
        {
            id:'0',
            logoUrl: ``,
            name:profilo.nomeEnte ,
            productRole: "Amministratore",
        }
    ];
   
    return (
       


        <div style={{display:'flex', backgroundColor:'white'}}>
            <div style={{width:'95%'}}>
                <div key={profilo.prodotto}>
                    <HeaderProduct
                        productId='1'
                        productsList={arrayProducts}
                        onSelectedProduct={(p) => console.log('Selected Item:', p.title)}
                        partyList={partyList}
                    ></HeaderProduct>
                </div>
            </div>
            <div className="d-flex justify-content-center m-auto">
                <Badge
                    badgeContent={1}
                    color="primary"
                    variant="standard"
                >
                    <IconButton onClick={()=> {
                        console.log('navigate');
                    } }  color="default">
                        <SimCardDownloadIcon fontSize="medium" sx={{color: '#17324D'}}
                        />
                    </IconButton>
                </Badge>
            </div>
        </div>
    );
};

export default HeaderProductEnte;

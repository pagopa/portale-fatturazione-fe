import React, { useContext, useEffect } from 'react';
import {HeaderProduct, PartyEntity} from '@pagopa/mui-italia';
import { arrayProducts } from '../../assets/dataLayout';
import { GlobalContext } from '../../store/context/globalContext';
import { Badge, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SimCardDownloadIcon from '@mui/icons-material/SimCardDownload';
import { PathPf } from '../../types/enum';
import { getMessaggiCountEnte } from '../../api/apiSelfcare/notificheSE/api';
import DownloadIcon from '@mui/icons-material/Download';

const HeaderProductEnte : React.FC = () => {
    const globalContextObj = useContext(GlobalContext);
    const {mainState,setCountMessages, countMessages } = globalContextObj;
    const profilo =  mainState.profilo;
    const token =  mainState.profilo.jwt;
    const navigate = useNavigate();

    useEffect(()=>{
        getCount();
    },[]);

    
    useEffect(()=>{
        if(globalContextObj.mainState.authenticated === true ){
            const interval = setInterval(() => {
                getCount();
            }, 20000);
            return () => clearInterval(interval); 
        }
    },[globalContextObj.mainState.authenticated]);

    const partyList : Array<PartyEntity> = [
        {
            id:'0',
            logoUrl: ``,
            name:profilo.nomeEnte ,
            productRole: "Amministratore",
        }
    ];


    //logica per il centro messaggi sospesa
    const getCount = async () =>{
        await getMessaggiCountEnte(token,profilo.nonce).then((res)=>{
            const numMessaggi = res.data;
            setCountMessages(numMessaggi);
        }).catch((err)=>{
            console.log(err);
        });
    };
   
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
                    badgeContent={countMessages}
                    color="primary"
                    variant="standard"
                >
                    <IconButton onClick={() => navigate(PathPf.ASYNC_DOCUMENTI_ENTE)}  color="default">
                        <DownloadIcon fontSize="medium" sx={{color: '#17324D'}}
                        />
                    </IconButton>
                </Badge>
            </div>
        </div>
    );
};

export default HeaderProductEnte;

import { useState, useEffect, useContext} from 'react';
import { useNavigate } from 'react-router';
import {HeaderProduct,PartyEntity, ProductEntity} from '@pagopa/mui-italia';
import MarkEmailUnreadIcon from '@mui/icons-material/MarkEmailUnread';
import Badge from '@mui/material/Badge';
import { IconButton } from '@mui/material';
import { GlobalContext } from '../../store/context/globalContext';
import { getAuthProfilo, redirect } from '../../api/api';
import { getMessaggiCount } from '../../api/apiPagoPa/centroMessaggi/api';
import { PathPf } from '../../types/enum';

const HeaderProductAzure = () => {
   
    const globalContextObj = useContext(GlobalContext);
    const {mainState, dispatchMainState,setCountMessages,countMessages } = globalContextObj;
    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;
    const navigate = useNavigate();


    const handleModifyMainState = (valueObj) => {
        dispatchMainState({
            type:'MODIFY_MAIN_STATE',
            value:valueObj
        });
    };

    const products:ProductEntity[] = [
        {
            id: 'prod-pn',
            title:'SEND - Servizio Notifiche Digitali',
            productUrl:"",
            linkType:"external"
        },
        {
            id: 'prod-pagopa',
            title:'Piattaforma pagoPA',
            productUrl:"",
            linkType:"external"
        }
    ];

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
        await getMessaggiCount(token,profilo.nonce).then((res)=>{
            const numMessaggi = res.data;
            setCountMessages(numMessaggi);
        }).catch((err)=>{
            console.log(err);
        });
    };
    
    useEffect(()=>{
        if(globalContextObj.mainState.authenticated === true ){
            const interval = setInterval(() => {
                getCount();
            }, 30000);
            return () => clearInterval(interval); 
        }
    },[globalContextObj.mainState.authenticated]);

    const getProfilo = async (jwt, productSelected)=>{
        await getAuthProfilo(jwt).then((resp) => {
            const storeProfilo = resp.data;
            const profiloDetails = {
                auth:storeProfilo.auth,
                nomeEnte:storeProfilo.nomeEnte,
                descrizioneRuolo:storeProfilo.descrizioneRuolo,
                ruolo:storeProfilo.ruolo,
                dataUltimo:storeProfilo.dataUltimo,
                dataPrimo:storeProfilo.dataPrimo,
                prodotto:storeProfilo.prodotto,
                jwt:productSelected.jwt,
                nonce:storeProfilo.nonce,
                profilo:storeProfilo.profilo
            };
           
            handleModifyMainState({
                ruolo:resp.data.ruolo,
                action:'',
                authenticated:true,
                profilo:profiloDetails
            });
            if(productSelected.prodotto === 'prod-pagopa'){
                navigate(PathPf.ANAGRAFICAPSP);
            }else if(productSelected.prodotto === 'prod-pn'){
                navigate(PathPf.LISTA_DATI_FATTURAZIONE);
            }
        }).catch(()=> {
            window.location.href = redirect;
        });
    };

    return (
        <div style={{display:'flex', backgroundColor:'white'}}>
            <div style={{width:'95%'}}>
                <div key={profilo.prodotto}>
                    <HeaderProduct
                        productId={profilo.prodotto}
                        productsList={products}
                        onSelectedProduct={(e) => {
                            const newProfilo:any = mainState.prodotti.find((el:any) => el.prodotto === e.id);
                            getProfilo(newProfilo.jwt,newProfilo);
                      
                        }}
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
                    <IconButton onClick={()=> {
                        navigate(PathPf.MESSAGGI);
                    } }  color="default">
                        <MarkEmailUnreadIcon fontSize="medium" sx={{color: '#17324D'}}
                        />
                    </IconButton>
                </Badge>
            </div>
        </div>
    );
};

export default HeaderProductAzure;

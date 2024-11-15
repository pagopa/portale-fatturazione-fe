import React, { useState, useEffect, useContext} from 'react';
import { useLocation, useNavigate } from 'react-router';
import {HeaderProduct,PartyEntity, ProductEntity} from '@pagopa/mui-italia';
import MarkEmailUnreadIcon from '@mui/icons-material/MarkEmailUnread';
import Badge from '@mui/material/Badge';
import { MainState } from '../../types/typesGeneral';
import { IconButton } from '@mui/material';
import { getMessaggiCount } from '../../api/apiPagoPa/centroMessaggi/api';
import { PathPf } from '../../types/enum';
import { GlobalContext } from '../../store/context/globalContext';
import { getAuthProfilo, redirect } from '../../api/api';

type HeaderNavProps = {
    mainState:MainState,
    dispatchMainState:any,
}




const HeaderNavComponent : React.FC = () => {
   
    const globalContextObj = useContext(GlobalContext);
    const {mainState, dispatchMainState } = globalContextObj;
    const token =  mainState.profilo.jwt;
    const profilo =  mainState.profilo;
    const location = useLocation();
    const navigate = useNavigate();


    const handleModifyMainState = (valueObj) => {
        dispatchMainState({
            type:'MODIFY_MAIN_STATE',
            value:valueObj
        });
    };
    

    const [countMessages, setCountMessages] = useState(0);
  
 
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

    const arrayProducts:ProductEntity[] = [
        {
            id: '1',
            title:'SEND - Servizio Notifiche Digitali',
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

    const hideHeadernav = location.pathname === '/auth' ||
                            location.pathname === '/azure' ||
                            location.pathname === '/auth/azure'||
                            location.pathname === '/azureLogin'||
                            !profilo.auth;


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
        if(globalContextObj.mainState.authenticated === true && profilo.auth === 'PAGOPA'){
            
            const interval = setInterval(() => {
                getCount();
            }, 4000);
      
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
            //const storeJwt = {token:productSelected.jwt};
            //localStorage.setItem('token', JSON.stringify(storeJwt));
            //eliminare il nonce
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




   
    const conditionalHeder = profilo.auth === 'PAGOPA' ?  (<div style={{display:'flex', backgroundColor:'white'}}>
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
        {profilo.auth === 'PAGOPA' &&
        <div className="d-flex justify-content-center m-auto">
            <Badge
                badgeContent={countMessages}
                color="primary"
                variant="standard"
            >
                <IconButton onClick={()=> {
                    navigate(PathPf.MESSAGGI);
                } }  color="default">
                    <MarkEmailUnreadIcon fontSize="medium" 
                        sx={{
                            color: '#17324D',
                        }}
                
                    />
                </IconButton>

            </Badge>
        </div>
        }
   
    </div>) :
        (<div >
            <HeaderProduct
                productId='1'
                productsList={arrayProducts}
                onSelectedProduct={(p) => console.log('Selected Item:', p.title)}
                partyList={partyList}
            ></HeaderProduct>
        </div>);
    
    return (
        <>
            {hideHeadernav ? null :
                conditionalHeder
            }
        </>

    );
};

export default HeaderNavComponent;

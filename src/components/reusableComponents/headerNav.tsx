import React, { useState, useEffect} from 'react';
import { useLocation, useNavigate } from 'react-router';
import {HeaderProduct,PartyEntity, ProductEntity} from '@pagopa/mui-italia';
import MarkEmailUnreadIcon from '@mui/icons-material/MarkEmailUnread';
import Badge from '@mui/material/Badge';
import { MainState } from '../../types/typesGeneral';
import { IconButton } from '@mui/material';
import { getMessaggiCount } from '../../api/apiPagoPa/centroMessaggi/api';
import { getProdotti, getProfilo, getToken } from '../../reusableFunction/actionLocalStorage';
import { PathPf } from '../../types/enum';
import { main } from '@popperjs/core';

type HeaderNavProps = {
    mainState:MainState,
    dispatchMainState:any
}


const HeaderNavComponent : React.FC<HeaderNavProps> =({mainState , dispatchMainState}) => {
    console.log('reload');
   
    const location = useLocation();
    const navigate = useNavigate();
    const prodotti = getProdotti().prodotti;
    const profilo =  getProfilo();
    const token = getToken();
  
    const handleModifyMainState = (valueObj) => {
        dispatchMainState({
            type:'MODIFY_MAIN_STATE',
            value:valueObj
        });
    };

    const [countMessages, setCountMessages] = useState(0);
    const arrayProducts:ProductEntity[] = [
        {
            id: '0',
            title: mainState.user.id === '0' ? 'Piattaforma pagoPA': 'SEND - Servizio Notifiche Digitali',
            productUrl:"",
            linkType:"external"
        }
    ];

    const productsList : Array<ProductEntity>  = [
        {
            id: '1',
            title: 'SEND - Servizio Notifiche Digitali',
            productUrl: '#send',
            linkType: 'external',
        }];

    /*
    useEffect(()=>{
    },
        {
            id: '1',
            title: 'SEND - Servizio Notifiche Digitali',
            productUrl:"",
            linkType:"external"
        }
        //let name = '';
        if(mainState.prodotti.length >0){
            const result:Array<ProductEntity> =  mainState.prodotti.map((el)=>{
           

                return ({
                    id: el.prodotto,
                    title: el.prodotto,
                    productUrl:"",
                    linkType:"external",
                });
            });
 
            setArrayProducts(result);
        }
        

    },[mainState.prodotti?.length]);
   */
 

 
   

    //const productsList : Array<ProductEntity>  = arrProdotti;

    //const cdnPath = 'https://assets.cdn.io.italia.it/logos/organizations/';


    const partyList : Array<PartyEntity> = [
        {
            id:'0',
            logoUrl: ``,
            name: '',
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
        if(mainState.authenticated === true && profilo.auth === 'PAGOPA'){
            getCount();
            const interval = setInterval(async() => {
                await getCount();
            }, 4000);
      
            return () => clearInterval(interval); 
         
        }
    },[mainState.authenticated]);


    



   
   
    const conditionalHeder = profilo.auth === 'PAGOPA' ?  (<div style={{display:'flex', backgroundColor:'white'}}>
        <div style={{width:'95%'}}>

            <HeaderProduct
                productId='0'
                productsList={arrayProducts}
                onSelectedProduct={(e) => {
                    console.log(e);
                    
                    let result; 
                    if(e.id === '0'){
                        result = mainState.prodotti.find(el => el.prodotto === "prod-pagopa");
                    }else if(e.id === '1'){
                        result = mainState.prodotti.find(el => el.prodotto === "prod-pn");
                    }
                    //console.log(profiloToPush,'ppp',mainState);
                  
                    let id = '0';
                    if(result?.prodotto === 'prod-pagopa'){
                        id = '0';
                    }else if(result?.prodotto === 'prod-pn'){
                        id = '1';
                    }
                    localStorage.removeItem("profilo");
                    localStorage.removeItem("token");
                    localStorage.setItem('profilo',JSON.stringify(result));
                    localStorage.setItem('token',JSON.stringify({token:result?.jwt}));
                    console.log(result,'ooo',e);

                    handleModifyMainState({user:{name:'', ruolo:result?.descrizioneRuolo, id:id }});
                
                }}
                partyList={partyList}
            ></HeaderProduct>
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
                productId='0'
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

import React, { useState, useEffect, useReducer} from 'react';
import { useLocation, useNavigate } from 'react-router';
import {HeaderProduct,PartyEntity, ProductEntity} from '@pagopa/mui-italia';
import MarkEmailUnreadIcon from '@mui/icons-material/MarkEmailUnread';
import Badge from '@mui/material/Badge';
import { MainState } from '../../types/typesGeneral';
import { IconButton } from '@mui/material';
import { getMessaggiCount } from '../../api/apiPagoPa/centroMessaggi/api';
import { getProdotti, getProfilo, getToken } from '../../reusableFunction/actionLocalStorage';
import { PathPf } from '../../types/enum';

type HeaderNavProps = {
    mainState:MainState,
    dispatchMainState:any,
}




const HeaderNavComponent : React.FC<HeaderNavProps> =({mainState , dispatchMainState}) => {
   
   
   
    const url = window.location.origin;
   
    const location = useLocation();
    const navigate = useNavigate();
    const getUserDetails = localStorage.getItem('profilo') || '{}';
    const UserDetailsParsed = JSON.parse(getUserDetails);
    const profilo =  getProfilo();
    const token = getToken();

  
    
    const camelizeDescizioneRuolo = () =>{
       
        const allLower =  UserDetailsParsed.descrizioneRuolo?.toLowerCase();
        const ruolo = allLower?.charAt(0).toUpperCase() + allLower?.slice(1);
        return {name:UserDetailsParsed.nomeEnte, ruolo };

    }; 
    const [user, setuser] = useState({name:'', ruolo:'' });

    useEffect(()=>{
        setuser(camelizeDescizioneRuolo());
    
    },[getUserDetails]);

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
            name: user.name,
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
            
            const interval = setInterval(() => {
                getCount();
            }, 4000);
      
            return () => clearInterval(interval); 
         
        }
    },[mainState.authenticated]);




   
    const conditionalHeder = profilo.auth === 'PAGOPA' ?  (<div style={{display:'flex', backgroundColor:'white'}}>
        <div style={{width:'95%'}}>

            <HeaderProduct
                productId={profilo.prodotto}
                productsList={products}
                onSelectedProduct={(e) => {
                  
                   
                    const result = mainState.prodotti.find(el => el.prodotto === e.id);
                   
                  
                    localStorage.removeItem("profilo");
                    localStorage.removeItem("token");
                    localStorage.setItem('profilo',JSON.stringify(result));
                    localStorage.setItem('token',JSON.stringify({token:result?.jwt}));

                    if(e.id === 'prod_pd'){
                       
                        window.location.assign(url+PathPf.LISTA_DATI_FATTURAZIONE);
                    }else{
                        window.location.assign(url+PathPf.ANAGRAFICAPSP);
                    }

                    console.log(url);
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

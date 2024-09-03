import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import {HeaderProduct} from '@pagopa/mui-italia';
import MarkEmailUnreadIcon from '@mui/icons-material/MarkEmailUnread';
import Badge from '@mui/material/Badge';
import { MainState } from '../../types/typesGeneral';
import { IconButton } from '@mui/material';
import { getMessaggiCount } from '../../api/apiPagoPa/centroMessaggi/api';
import { getProfilo, getToken } from '../../reusableFunction/actionLocalStorage';
import { PathPf } from '../../types/enum';

type PartySwitchItem = {
    id: string;
    name: string;
    productRole?: string;
    logoUrl?: string;
    parentName?: string;
    icon?:any
};
type LinkType = "internal" | "external";
type ProductSwitchItem = {
    id: string;
    title: string;
    productUrl: string;
    linkType: LinkType;
};
type PartyEntity = PartySwitchItem;
type ProductEntity = ProductSwitchItem;

type HeaderNavProps = {
    mainState:MainState,
    dispatchMainState:any
}

const HeaderNavComponent : React.FC<HeaderNavProps> =({mainState, dispatchMainState}) => {
   
    const location = useLocation();
    const navigate = useNavigate();
    const getUserDetails = localStorage.getItem('profilo') || '{}';
    const UserDetailsParsed = JSON.parse(getUserDetails);
    const profilo =  getProfilo();
    const token = getToken();

    const handleModifyMainState = (valueObj) => {
        dispatchMainState({
            type:'MODIFY_MAIN_STATE',
            value:valueObj
        });
    };
    
    const camelizeDescizioneRuolo = () =>{
       
        const allLower =  UserDetailsParsed.descrizioneRuolo?.toLowerCase();
        const ruolo = allLower?.charAt(0).toUpperCase() + allLower?.slice(1);
        return {name:UserDetailsParsed.nomeEnte, ruolo };

    }; 
    const [user, setuser] = useState({name:'', ruolo:'' });
    const [countMessages, setCountMessages] = useState(0);

    useEffect(()=>{
        setuser(camelizeDescizioneRuolo());
    
    },[getUserDetails]);

    const productsList : Array<ProductEntity>  = [
        {
            id: '1',
            title: 'SEND - Servizio Notifiche Digitali',
            productUrl: '#send',
            linkType: 'external',
        }];

    const cdnPath = 'https://assets.cdn.io.italia.it/logos/organizations/';
    const name = user.name;

    const partyList : Array<PartyEntity> = [
        {
            id: '0',
            logoUrl: ``,
            name: name,
            productRole: user.ruolo,
        },
    ];

    const hideHeadernav = location.pathname === '/auth' ||
                            location.pathname === '/azure' ||
                            location.pathname === '/auth/azure'||
                            location.pathname === '/azureLogin'||
                            !UserDetailsParsed.auth;


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
            }, 3000);
      
            return () => clearInterval(interval); 
         
        }
    },[mainState.authenticated]);

    const conditionalHeder = profilo.auth === 'PAGOPA' ?  (<div style={{display:'flex', backgroundColor:'white'}}>
        <div style={{width:'95%'}}>
            <HeaderProduct
                productId="1"
                productsList={productsList}
                onSelectedProduct={(p) => console.log('Selected Item:', p.title)}
                partyList={partyList}
            ></HeaderProduct>
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
                    <MarkEmailUnreadIcon fontSize="medium" 
                        sx={{
                            color: '#17324D',
                        }}
                
                    />
                </IconButton>

            </Badge>
        </div>
   
    </div>) :
        (<div >
            <HeaderProduct
                productId="1"
                productsList={productsList}
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

import React, { ReactNode, useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import {HeaderProduct} from '@pagopa/mui-italia';
import MarkEmailUnreadIcon from '@mui/icons-material/MarkEmailUnread';
import Badge from '@mui/material/Badge';

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

const HeaderNavComponent : React.FC =() => {
   
    const location = useLocation();
    const getUserDetails = localStorage.getItem('profilo') || '{}';
    const UserDetailsParsed = JSON.parse(getUserDetails);
    const camelizeDescizioneRuolo = () =>{
       
        const allLower =  UserDetailsParsed.descrizioneRuolo?.toLowerCase();
        const ruolo = allLower?.charAt(0).toUpperCase() + allLower?.slice(1);
        return {name:UserDetailsParsed.nomeEnte, ruolo };

    }; 
    const [user, setuser] = useState({name:'', ruolo:'' });

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
    
    return (
        <>
            {hideHeadernav ? null :
                <HeaderProduct
                    productId="1"
                    productsList={productsList}
                    onSelectedProduct={(p) => console.log('Selected Item:', p.title)}
                    partyList={partyList}
                ></HeaderProduct>}
        </>

    );
};

export default HeaderNavComponent;

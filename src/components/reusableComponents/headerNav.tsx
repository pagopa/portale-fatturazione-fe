import React, { ReactNode, useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import {
    HeaderProduct,
} from '@pagopa/mui-italia';
import { LocationState } from '../../types/typesGeneral';

type PartySwitchItem = {
    id: string;
    name: string;
    productRole?: string;
    logoUrl?: string;
    parentName?: string;
};
type LinkType = "internal" | "external";
type ProductSwitchItem = {
    id: string;
    title: string;
    productUrl: string;
    linkType: LinkType;
    icon?: ReactNode;
};
type PartyEntity = PartySwitchItem;
type ProductEntity = ProductSwitchItem;

const HeaderNavComponent : React.FC =() => {
   
    const location : any = useLocation();
    const getUserDetails = localStorage.getItem('profilo') || '{}';

    const camelizeDescizioneRuolo = () =>{
       
        const UserDetailsParsed = JSON.parse(getUserDetails);
        const allLower =  UserDetailsParsed.descrizioneRuolo?.toLowerCase();
        const ruolo = allLower?.charAt(0).toUpperCase() + allLower?.slice(1);
        return {name:UserDetailsParsed.nomeEnte, ruolo };

    }; 
    const [user, setuser] = useState({name:'', ruolo:'' });

    useEffect(()=>{
        setuser(camelizeDescizioneRuolo());
    
    },[getUserDetails]);
    

    const [title, setTitle] = useState('0');
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
            logoUrl: `${cdnPath}1199250158.png`,
            name: name,
            productRole: user.ruolo,
            
        },
    ];

    
    return (
        <>
            {(location.pathname === '/error' || location.pathname === '/auth') ? null :
                <HeaderProduct
                    productId="1"
                    productsList={productsList}
                    onSelectedProduct={(p) => console.log('Selected Item:', p.title)}
                    partyList={partyList}
                    chipSize='small'
                />}
        </>
       



    );
};

export default HeaderNavComponent;

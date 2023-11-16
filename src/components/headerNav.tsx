import React, { ReactNode, useState } from 'react';
import {
    HeaderProduct,
} from '@pagopa/mui-italia';

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

    const [title, setTitle] = useState('1');
    const productsList : Array<ProductEntity>  = [
        {
            id: '0',
            title: 'Piattaforma PagoPa',
            productUrl: '#Piattaforma PagoPa',
            linkType: 'external',
        },
        {
            id: '1',
            title: 'SEND - Servizio Notifiche Digitali',
            productUrl: '#send',
            linkType: 'external',
        }];

    const cdnPath = 'https://assets.cdn.io.italia.it/logos/organizations/';

    const partyList : Array<PartyEntity> = [
        {
            id: '0',
            name: `Commissario straordinario per la realizzazione di
          approdi temporanei e di interventi complementari per la
          salvaguardia di Venezia e della sua laguna e ulteriori
          interventi per la salvaguardia della laguna di Venezia`,
            productRole: 'Amministratore',
            logoUrl: `${cdnPath}1199250158.png`,
        },
        {
            id: '1',
            logoUrl: `${cdnPath}2438750586.png`,
            name: 'Comune di Roma',
            productRole: 'Amministratore',
        }];

    
    return (
        <HeaderProduct
            productId="1"
            productsList={productsList}
            onSelectedProduct={(p) => console.log('Selected Item:', p.title)}
            partyList={partyList}
            chipSize='small'
        />



    );
};

export default HeaderNavComponent;

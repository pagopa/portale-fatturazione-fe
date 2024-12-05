import React, {useContext} from 'react';
import {HeaderProduct,PartyEntity, ProductEntity} from '@pagopa/mui-italia';
import { GlobalContext } from '../../store/context/globalContext';

const HeaderProductEnte : React.FC = () => {
   
    const globalContextObj = useContext(GlobalContext);
    const {mainState } = globalContextObj;
    const profilo =  mainState.profilo;

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

    return (
        <HeaderProduct
            productId='1'
            productsList={arrayProducts}
            onSelectedProduct={(p) => console.log('Selected Item:', p.title)}
            partyList={partyList}
        ></HeaderProduct>
    );
};

export default HeaderProductEnte;

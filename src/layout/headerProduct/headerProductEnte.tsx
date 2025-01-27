import React, { useContext } from 'react';
import {HeaderProduct, PartyEntity} from '@pagopa/mui-italia';
import { arrayProducts } from '../../assets/dataLayout';
import { GlobalContext } from '../../store/context/globalContext';

const HeaderProductEnte : React.FC = () => {
    const globalContextObj = useContext(GlobalContext);
    const {mainState} = globalContextObj;
    const profilo =  mainState.profilo;

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

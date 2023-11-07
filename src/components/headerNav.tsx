import React from 'react';
import {
  HeaderProduct,
} from '@pagopa/mui-italia';

const HeaderNavComponent : React.FC =() => {
  const productsList = [
    {
      id: '0',
      title: 'Piattaforma PagoPa',
      productUrl: '#Piattaforma PagoPa',
      linkType: 'external',
    },
    {
      id: '1',
      title: 'Send',
      productUrl: '#send',
      linkType: 'external',
    }];

  const cdnPath = 'https://assets.cdn.io.italia.it/logos/organizations/';

  const partyList = [
    {
      id: '0',
      name: `Commissario straordinario per la realizzazione di
          approdi temporanei e di interventi complementari per la
          salvaguardia di Venezia e della sua laguna e ulteriori
          interventi per la salvaguardia della laguna di Venezia`,
      productRole: 'Referente amministrativo',
      logoUrl: `${cdnPath}1199250158.png`,
    },
    {
      id: '1',
      logoUrl: `${cdnPath}2438750586.png`,
      name: 'Comune di Roma',
      productRole: 'Referente amministrativo',
    }];
  return (
    <HeaderProduct
      productId="1"
      productsList={productsList}
      onSelectedProduct={(p) => console.log('Selected Item:', p.title)}
      partyList={[partyList[0]]}

    />



  );
};

export default HeaderNavComponent;

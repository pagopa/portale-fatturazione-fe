import React from 'react';
import { Typography, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { ButtonNaked } from '@pagopa/mui-italia';


interface PageTitleProps {
  statusPage: string,
  setStatusPage : any
}

const PageTitleNavigation : React.FC<PageTitleProps> = ({ statusPage, setStatusPage }) => {
  let titleNavigation;

  if (statusPage === 'immutable') {
    titleNavigation = 'Dati di fatturazione';
  } else {
    titleNavigation = 'Modifica dati di fatturazione';
  }

  return (
    <div className="mx-5 mt-2">
      {statusPage === 'mutable'
        ? (
          <div>
            <ButtonNaked
              color="primary"
              onFocusVisible={() => { console.log('onFocus'); }}
              size="small"
              startIcon={<ArrowBackIcon />}
              onClick={() => setStatusPage('immutable')}
            >
              Esci
            </ButtonNaked>
            <Typography sx={{ marginLeft: '10px' }} variant="caption">Navigazione</Typography>

          </div>
        ) : null}
      <div className="mt-3">
        <Typography variant="h4">{titleNavigation}</Typography>
      </div>
      {statusPage === 'immutable' ? (
        <div className="text-end mt-3">
          <Button onClick={() => setStatusPage('mutable')} variant="contained" size="small">Modifica</Button>
        </div>
      ) : null}

    </div>

  );
};
export default  PageTitleNavigation;
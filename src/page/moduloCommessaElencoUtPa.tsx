import React from 'react';
import {
  Button, Box, Typography,
} from '@mui/material';
import SelectComponet from '../components/select';
import GridComponent from '../components/grid';




export default function ModuloCommessaElencoUtPa() {
  const input3 : any[] = ['', 2019, 2020, 2021, 2022];
  const gridData = [{
    id: 0,
    Mese: 'Gennaio',
    Lavorazione: 'aperta',
    Stato: 'aperta/caricato',
    'Not. Digitali': 1000,
    'Not. Analog. AR. Naz.': 123,
    'Not. Analog. AR. No Naz.': 234,
    'Not. Analog. 890/1982': 1982,
    'Tot. Mod. Commessa': '1200 €',
  },
  {
    id: 1,
    Mese: 'Gennaio',
    Lavorazione: 'aperta',
    Stato: 'aperta/caricato',
    'Not. Digitali': 1000,
    'Not. Analog. AR. Naz.': 123,
    'Not. Analog. AR. No Naz.': 234,
    'Not. Analog. 890/1982': 1982,
    'Tot. Mod. Commessa': '1200 €',
  },
  {
    id: 2,
    Mese: 'Gennaio',
    Lavorazione: 'aperta',
    Stato: 'aperta/caricato',
    'Not. Digitali': 1000,
    'Not. Analog. AR. Naz.': 123,
    'Not. Analog. AR. No Naz.': 234,
    'Not. Analog. 890/1982': 1982,
    'Tot. Mod. Commessa': '1200 €',
  },
  {
    id: 4,
    Mese: 'Gennaio',
    Lavorazione: 'aperta',
    Stato: 'aperta/caricato',
    'Not. Digitali': 1000,
    'Not. Analog. AR. Naz.': 123,
    'Not. Analog. AR. No Naz.': 234,
    'Not. Analog. 890/1982': 1982,
    'Tot. Mod. Commessa': '1200 €',
  },
  {
    id: 5,
    Mese: 'Gennaio',
    Lavorazione: 'aperta',
    Stato: 'aperta/caricato',
    'Not. Digitali': 1000,
    'Not. Analog. AR. Naz.': 123,
    'Not. Analog. AR. No Naz.': 234,
    'Not. Analog. 890/1982': 1982,
    'Tot. Mod. Commessa': '1200 €',
  },
  {
    id: 6,
    Mese: 'Gennaio',
    Lavorazione: 'aperta',
    Stato: 'aperta/caricato',
    'Not. Digitali': 1000,
    'Not. Analog. AR. Naz.': 123,
    'Not. Analog. AR. No Naz.': 234,
    'Not. Analog. 890/1982': 1982,
    'Tot. Mod. Commessa': '1200 €',
  },{
    id: 0,
    Mese: 'Gennaio',
    Lavorazione: 'aperta',
    Stato: 'aperta/caricato',
    'Not. Digitali': 1000,
    'Not. Analog. AR. Naz.': 123,
    'Not. Analog. AR. No Naz.': 234,
    'Not. Analog. 890/1982': 1982,
    'Tot. Mod. Commessa': '1200 €',
  },
  {
    id: 7,
    Mese: 'Gennaio',
    Lavorazione: 'aperta',
    Stato: 'aperta/caricato',
    'Not. Digitali': 1000,
    'Not. Analog. AR. Naz.': 123,
    'Not. Analog. AR. No Naz.': 234,
    'Not. Analog. 890/1982': 1982,
    'Tot. Mod. Commessa': '1200 €',
  },
  {
    id: 8,
    Mese: 'Gennaio',
    Lavorazione: 'aperta',
    Stato: 'aperta/caricato',
    'Not. Digitali': 1000,
    'Not. Analog. AR. Naz.': 123,
    'Not. Analog. AR. No Naz.': 234,
    'Not. Analog. 890/1982': 1982,
    'Tot. Mod. Commessa': '1200 €',
  }];
  return (

    <div className="m-5">
      <div>
        <Typography variant="h4">Modulo commessa</Typography>
      </div>

      <div className="text-end">
        <Button onClick={() => console.log('pagina aggiungi modulo commessa')} variant="contained" size="small">Aggiungi Nuovo</Button>
      </div>
      <div className="mb-5">

        <Box sx={{ display: 'flex' }}>
          <SelectComponet inputLabel="Filtra per anno" inputElements={input3} showIcon />
          <Button
            size="small"
            variant="contained"
            sx={{ marginTop: 'auto', marginBottom: 'auto', marginLeft: '30px' }}
          >
            Filtra

          </Button>
          <Typography
            variant="caption-semibold"
            sx={{
              marginTop: 'auto',
              marginBottom: 'auto',
              marginLeft: '30px',
              cursor: 'pointer',
              color: '#0062C3',
            }}
          >
            Annulla filtri

          </Typography>
        </Box>

      </div>

      <div>
        <GridComponent data={gridData} />
      </div>

    </div>
  );
}

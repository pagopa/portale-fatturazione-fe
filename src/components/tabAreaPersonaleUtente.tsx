import React, { useState } from 'react';
import '../style/areaPersonaleUtenteEnte.css';
import { Box } from '@mui/material';

import RadioComponent from './radio';
import DataComponent from './data';
import DynamicInsert from './dynamicInsert';
import SelectComponet from './select';
import TextFieldComponent from './textField';
import LabelComponent from './label';

function TabAreaPersonaleUtente() {
  const [splitPayment, setSplitPayment] = useState('');
  const [tipoDati, setTipoDati] = useState('');

  const exampleDate = new Date().toLocaleDateString('en-GB');
  return (

    <div className="m-5 pb-5 bg-white rounded">

      <div className="m-4 pt-4">

        <div>
          <RadioComponent
            valueRadio={tipoDati}
            setValueRadio={setTipoDati}
            options={['Dati ordine d\'acquisto', 'Dati contratto']}
          />
        </div>

        {/* first box cap cig split radio  start */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 2fr)', marginTop: '30px' }}>
          {/* CUP start */}
          <div>
            <TextFieldComponent
              helperText="max 15 caratteri alfanumerici"
              label="CUP"
              placeholder="Inserisci il CUP"
              fullWidth={false}
            />

          </div>
          {/* CUP end */}
          {/* CIG start */}
          <div>
            <TextFieldComponent
              helperText="max 10 caratteri alfanumerici"
              label="CIG"
              placeholder="Inserisci il CIG"
              fullWidth={false}
            />
          </div>
          {/* CIG end */}
          {/* radio start */}
          <div>
            <RadioComponent
              valueRadio={splitPayment}
              setValueRadio={setSplitPayment}
              label="Split Paymet"
              options={['Si', 'No']}
            />
          </div>
          {/* radio start */}
          {/* Box tipo contratto start      */}
          <SelectComponet inputLabel="Tipo Contratto:" inputElements={['', 'PAC', 'PAL']} showIcon={false} />
          {/* Box tipo contratto end */}
          <div />
        </Box>

        {/* first box cap cig split radio  end */}
        {/* secondo box   start */}
        <div>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 2fr)', marginTop: '30px' }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 2fr)' }}>
              {/* Id documento start */}
              <div>
                <TextFieldComponent
                  helperText="max 20 caratteri alfanumerici"
                  label="ID Documento"
                  placeholder="Inserisci ID"
                  fullWidth={false}
                />
              </div>
              {/* id documento end */}
              {/* data notifica start */}
              <div>
                <DataComponent dataLabel="Data documento" formatDate="dd/MM/yyyy" />
              </div>
              {/* data notifica end */}
            </Box>
            {/* commessa start */}
            <div>
              <TextFieldComponent
                helperText="max 100 caratteri alfanumerici"
                label="Codice. Commessa/Convenzione"
                placeholder="Commessa/Convenzione"
                fullWidth
              />
            </div>
            {/* commessa end */}
            <div />
          </Box>
        </div>
        {/* secondo box   end */}
        {/* terzo box   start */}
        <div className="mt-3">
          <DynamicInsert />
        </div>

        {/* terzo box   end */}
        <hr className="mx-5 mt-5" />
        <div className="d-flex justify-content-around mt-5">
          <LabelComponent label="Data primo accesso" input={exampleDate} />
          <LabelComponent label="Data ultimo accesso" input={exampleDate} />
        </div>

      </div>

    </div>
  );
}

export default TabAreaPersonaleUtente;

import React, { useState, useEffect } from 'react';
import '../style/areaPersonaleUtenteEnte.css';
import { Box, InputLabel, Typography } from '@mui/material';
import RadioComponent from './radio';
import DataComponent from './data';
import DynamicInsert from './dynamicInsert';
import SelectComponet from './select';
import TextFieldComponent from './textField';
import LabelComponent from './label';
import axios from 'axios';

type Contatti = {
  email: string,
  tipo: number
}
interface TabAreaPesonaleProps{
  statusPage: string;
}

interface DatiFatturazione{
  flagOrdineContratto:string,
  splitPayment:boolean,
  cup: string,
  cig:string,
  idDocumento:string,
  codCommessa:string,
  contatti: Contatti[],
}


const TabAreaPersonaleUtente : React.FC<TabAreaPesonaleProps> = (props) => {

const {statusPage } = props;


  

  const exampleDate = new Date().toLocaleDateString('en-GB');



  const [datiFatturazione, setDatiFatturazione] = useState<DatiFatturazione>({
    flagOrdineContratto:'',
    splitPayment:false,
    cup: '',
    cig:'',
    idDocumento:'',
    codCommessa:'',
    contatti:[],
  });




  const getDatiFatturazione  = async () => {
    const response = await axios.get(
      `https://portalefatturebeapi20231102162515.azurewebsites.net/api/datifatturazione/17`).then( (res) => {
       setDatiFatturazione(res.data);
      
        console.log(res.data, 'CICCIO');
          return res.data;
      });
      return response;
};


  useEffect(()=>{

    getDatiFatturazione();

  }, []);

const valueOptionRadioTipoOrdine = [
  {descrizione:'Dati ordine d\'acquisto', id:"1"},
  {descrizione:'Dati contratto', id:"2"}
  ];

  const valueOptionRadioSplitPayment = [
    {descrizione:'Si', id: '1'},
    {descrizione:'No', id: '2'}
    ];

   let booleanToStringSplitPayment; 
    if(datiFatturazione.splitPayment){
      booleanToStringSplitPayment = '1';
    }else{
      booleanToStringSplitPayment = '2';
    }
const [ordineacquisto, setOrdineAcquisto] = useState();
const [split, setSplit] = useState();
  return (

    <div className="m-5 pb-5 bg-white rounded">

      <div className="m-4 pt-4">

        <div>
          <RadioComponent
            options={valueOptionRadioTipoOrdine}
            status={statusPage}
            valueRadio={ordineacquisto || datiFatturazione.flagOrdineContratto}
            setValueRadio={setOrdineAcquisto}
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
              status={statusPage}
              value={datiFatturazione.cup}
             
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
              status={statusPage}
              value={datiFatturazione.cig}
             
            />
          </div>
          {/* CIG end */}
          {/* radio start  */}
          <div>
            <RadioComponent
              valueRadio={split || booleanToStringSplitPayment}
              label="Split Paymet"
              options={valueOptionRadioSplitPayment}
              status={statusPage}
              setValueRadio={setSplit}
            />
          </div>
         
          {/* radio start */}
          {/* Box tipo contratto start    
          <SelectComponet inputLabel="Tipo Contratto:"  showIcon={false} status={statusPage} />
           Box tipo contratto end */}

             <div>
                <TextFieldComponent
                  helperText="Inserisci Mail Pec"
                  label="Mail Pec"
                  placeholder="Inserisci Mail Pec"
                  fullWidth={false}
                  status={statusPage}
                  value={'gino@gino.it'}
                />
              </div>
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
                  status={statusPage}
                  value={datiFatturazione.idDocumento}
                />
              </div>
              {/* id documento end */}
              {/* data notifica start */}
              <div>
                <DataComponent dataLabel="Data documento" formatDate="dd/MM/yyyy" status={statusPage} />
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
                status={statusPage}
                value={datiFatturazione.codCommessa}
              />
            </div>
            {/* commessa end */}
            <div />
          </Box>
        </div>
        {/* secondo box   end */}
        {/* terzo box   start */}
        <div className="mt-3">
          <DynamicInsert status={statusPage} arrElement={datiFatturazione.contatti} />
        </div>

        {/* terzo box   end */}
        <hr className="mx-5 mt-5" />
        <div className="d-flex justify-content-around mt-5">
          <div className='d-flex'>
           <InputLabel  sx={{ marginRight:'20px'}}  size={"normal"}>Data primo accesso</InputLabel>
           <Typography >{exampleDate}</Typography>
          </div>

          <div className='d-flex'>
           <InputLabel sx={{ marginRight:'20px'}}  size={"normal"}>Data ultimo accesso</InputLabel>
           <Typography >{exampleDate}</Typography>
          </div>
        
        
        </div>

      </div>

    </div>
  );
};

export default TabAreaPersonaleUtente;

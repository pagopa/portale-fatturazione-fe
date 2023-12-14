import React, {useContext } from 'react';
import '../style/areaPersonaleUtenteEnte.css';
import { Box, InputLabel, Typography, Checkbox, FormControlLabel } from '@mui/material';
import RadioComponent from './radio';
import DataComponent from './data';
import DynamicInsert from './dynamicInsert';
import TextFieldComponent from './textField';
import {AreaPersonaleContext} from '../types/typesAreaPersonaleUtenteEnte';

import { DatiFatturazioneContext } from '../page/areaPersonaleUtenteEnte';





const TabAreaPersonaleUtente = () => {
    const {infoModuloCommessa,datiFatturazione,setDatiFatturazione, user} = useContext<AreaPersonaleContext>(DatiFatturazioneContext);

    console.log({datiFatturazione});
    function createDateFromString(string:string){
        const getGiorno = new Date(string).getDate();
        console.log({getGiorno});
        const getMese = new Date(string).getMonth() + 1;
        const getAnno = new Date(string).getFullYear();

        return getGiorno+'/'+getMese+'/'+getAnno;
    }


    
   

    const valueOptionRadioTipoOrdine = [
        {descrizione:'Dati ordine d\'acquisto', id:"1"},
        {descrizione:'Dati contratto', id:"2"}
    ];

    const valueOptionRadioSplitPayment = [
        {descrizione:'Si', id: true},
        {descrizione:'No', id: false},
    ];

    const getProfilo =  localStorage.getItem('profilo') || '{}';
    const parseProfilo = JSON.parse(getProfilo);
  
  

    return (

        <div className="ms-5 me-5 mb-5  bg-white rounded">
            
            <div className="ms-4  me-4 pt-4 marginTop24">

                <div>
                    <RadioComponent
                        options={valueOptionRadioTipoOrdine}
                        valueRadio={datiFatturazione.tipoCommessa}
                        keyObject='tipoCommessa'
                      
                    />
                </div>

                {/* first box cap cig split radio  start */}
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 2fr)', marginTop: '30px' }}>
                    {/* CUP start */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 2fr)' }}>
                        <div>
                            <TextFieldComponent
                                helperText="max 15 caratteri alfanumerici"
                                label="CUP"
                                placeholder="Inserisci il CUP"
                                fullWidth={false}
                                value={datiFatturazione.cup}
                                keyObject='cup'
                                dataValidation={{max:15,validation:'Validazione Mail'}}
                            />

                        </div>
                        {/* CUP end */}
                        {/* CIG start 
                    <div>
                        <TextFieldComponent
                            helperText="max 10 caratteri alfanumerici"
                            label="CIG"
                            placeholder="Inserisci il CIG"
                            fullWidth={false}
                            value={datiFatturazione.cig}
                            keyObject='cig'
                            dataValidation={{max:10,validation:'Max 10 caratteri'}}
                        />
                    </div>
                    CIG end */}
                        {/* radio start  */}
                        <div>
                            <RadioComponent
                                valueRadio={datiFatturazione.splitPayment}
                                label="Split Payment"
                                options={valueOptionRadioSplitPayment}
                                keyObject='splitPayment'
                            />
                        </div>
                    </Box>
                  
         
                    {/* radio start */}
                    {/* Box tipo contratto start    
          <SelectComponet inputLabel="Tipo Contratto:"  showIcon={false} status={statusPage} />
           Box tipo contratto end */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(1, 2fr)' }}>
                        <div>
                            <TextFieldComponent
                                helperText="Inserisci Mail Pec"
                                label="Mail Pec"
                                placeholder="Inserisci Mail Pec"
                                fullWidth
                                value={datiFatturazione.pec}
                                keyObject='pec'
                                dataValidation={{max:15,validation:'Max 15 caratteri'}}
                            
                            />
                        </div>
                    </Box>
                   
                   
          
                </Box>
                <div />
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
                                    value={datiFatturazione.idDocumento}
                                    keyObject='idDocumento'
                                    dataValidation={{max:20,validation:'Max 20 caratteri'}}
                                />
                            </div>
                            {/* id documento end */}
                            {/* data notifica start */}
                            <div>
                                <DataComponent 
                                    dataLabel="Data documento"
                                    formatDate="dd/MM/yyyy"
                                />
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
                                value={datiFatturazione.codCommessa}
                                keyObject='codCommessa'
                                dataValidation={{max:100,validation:'Max 100 caratteri'}}
                            />
                        </div>
                        {/* commessa end */}
                        <div />
                    </Box>
                </div>
                {/* secondo box   end */}
                {/* terzo box   start */}
                <div className="mt-3">
                    <DynamicInsert status={infoModuloCommessa?.statusPageDatiFatturazione} arrElement={datiFatturazione.contatti} setData={setDatiFatturazione} />
                </div>

                {/* terzo box   end */}
                {/*checkbox start */}
                
                <FormControlLabel  sx={{
                    marginTop:'24px',
                    '& .MuiFormControlLabel-label': {
                        fontSize: '0.8rem',
                    },
                }}  
                control={<Checkbox 
                    checked={datiFatturazione.notaLegale || false}
                    onChange={()=> setDatiFatturazione((prev:any)=>({...prev,...{notaLegale:!datiFatturazione.notaLegale}}))}/>}
                disabled={infoModuloCommessa.statusPageDatiFatturazione === 'immutable'}
                label="Tutti gli accordi di adesione e tutti gli accordi di collaborazione pubblico-
                           pubblico, in quanto contratti esclusi dall`applicazione del Codice dei contratti pubblici, 
                           rispettivamente, ai sensi dell`art. 56, comma 1, lett a) del D.lgs 36/2023, e ai sensi dell`art. 7, comma 4 D.l.gs 36/2023,
                           non sono sottoposti alla disciplina della tracciabilità dei flussi finanziari di cui alla Legge 136/2010,
                           come indicato dall`ANAC nelle Linee guida sulla tracciabilità dei flussi finanziari 
                          (si veda par. 2.5. della Determinazione n. 4 del 7 luglio 2011 aggiornata con delibera n. 371 del 27 luglio 2022)" />

                {/*checkbox start */}
                <hr className="mx-3 mt-5" />
                <div className="d-flex justify-content-around marginTopBottom24">
                    <div className='d-flex'>
                        <InputLabel  sx={{ marginRight:'20px'}}  size={"normal"}>Data primo accesso</InputLabel>
                        {user === 'old' ? <Typography >{createDateFromString(parseProfilo.dataPrimo)}</Typography>: null}
                    </div>

                    <div className='d-flex'>
                        <InputLabel sx={{ marginRight:'20px'}}  size={"normal"}>Data ultimo accesso</InputLabel>
                        {user === 'old' ? <Typography >{createDateFromString(parseProfilo.dataUltimo)}</Typography>: null}
                        
                    </div>
        
        
                </div>

            </div>

        </div>
    );
};

export default TabAreaPersonaleUtente;

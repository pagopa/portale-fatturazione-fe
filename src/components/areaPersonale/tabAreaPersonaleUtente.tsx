import {useContext } from 'react';
import '../../style/areaPersonaleUtenteEnte.css';
import { Box, InputLabel, Typography, Checkbox, FormControlLabel } from '@mui/material';
import { red } from '@mui/material/colors';
import RadioComponent from './radio';
import DataComponent from './data';
import DynamicInsert from './dynamicInsert';
import TextFieldComponent from './textField';
import {AreaPersonaleContext} from '../../types/typesAreaPersonaleUtenteEnte';
import { DatiFatturazioneContext } from '../../page/areaPersonaleUtenteEnte';

const TabAreaPersonaleUtente = () => {
    const {mainState,datiFatturazione,setDatiFatturazione, user} = useContext<AreaPersonaleContext>(DatiFatturazioneContext);

   
    function createDateFromString(string:string){
        const getGiorno = new Date(string).getDate();
      
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
                                required={false}
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
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(1, 2fr)' }}>
                        <div>
                            <TextFieldComponent
                                required={true}
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
                                    required={false}
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
                                required={false}
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
                    <DynamicInsert status={mainState?.statusPageDatiFatturazione} arrElement={datiFatturazione.contatti} setData={setDatiFatturazione} />
                </div>
                {/* terzo box   end */}
                {/*checkbox start */}
                <FormControlLabel  sx={{
                    marginTop:'24px',
                    '& .MuiFormControlLabel-label': {
                        fontSize: '0.8rem',
                       
                    },
                    '&.MuiFormControlLabel-root': {
                        marginLeft:'0',
                        marginRight:'0'
                    }
                }}  
                required
                labelPlacement="start"
                control={<Checkbox 
                    sx={{color: red[800]}}
                    checked={datiFatturazione.notaLegale || false}
                    onChange={()=> setDatiFatturazione((prev:any)=>({...prev,...{notaLegale:!datiFatturazione.notaLegale}}))}/>}
                disabled={mainState.statusPageDatiFatturazione === 'immutable'}
                label="Gli accordi di adesione a SEND sono esclusi dall`applicazione del Codice dei Contratti Pubblici ai
                 sensi dell`art. 56, comma 1, lett a) del D.lgs. 36/2023 pertanto non sono sottoposti alla disciplina della
                  tracciabilità dei flussi finanziari di cui alla L. 136/2010, come indicato dall`ANAC nelle relative Linee Guida.
                Conseguentemente, il CIG non deve essere acquisito e riportato nelle fatture "
                />

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

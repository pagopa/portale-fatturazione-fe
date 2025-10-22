import '../../style/areaPersonaleUtenteEnte.css';
import { Box, InputLabel, Typography, Checkbox, FormControlLabel, FormControl } from '@mui/material';
import RadioComponent from './radio';
import DataComponent from './data';
import DynamicInsert from './dynamicInsert';
import TextFieldComponent from './textField';
import { createDateFromString } from '../../reusableFunction/function';


const TabAreaPersonaleUtente = ({mainState,datiFatturazione,setDatiFatturazione,setStatusButtonConferma,setOpenModalVerifica}) => {
    const valueOptionRadioTipoOrdine = [
        {descrizione:'Dati ordine d\'acquisto', id:"1"},
        {descrizione:'Dati contratto', id:"2"}
    ];

    const valueOptionRadioSplitPayment = [
        {descrizione:'Si', id: true},
        {descrizione:'No', id: false},
    ];

    const colorAsterisco = mainState.statusPageDatiFatturazione === 'immutable' ? '#C3CAD1': 'black'; 

    return (

        <div className="ms-5 me-5 mb-5  bg-white rounded">
            <div className="ms-4  me-4 pt-4 marginTop24">
                <FormControl
                    required
                    component={Box}
                    sx={{
                        border:(!mainState.datiFatturazione && datiFatturazione.tipoCommessa === "") ?  "2px solid #FE6666" : "1px solid #ccc",
                        borderRadius: 2,
                        p: 2,
                        mb: 2,

                    }}
                >
                    <Box
                        component="span"
                        sx={{
                            color: (!mainState.datiFatturazione && datiFatturazione.tipoCommessa === "") ? "#FE6666":"grey",
                            position: "absolute",
                            top: -3,
                            right: 8,
                            fontSize: "18px",
                            fontWeight: "bold"
                        }}
                    >
    *
                    </Box>
                    <RadioComponent
                        options={valueOptionRadioTipoOrdine}
                        valueRadio={datiFatturazione.tipoCommessa}
                        keyObject='tipoCommessa'
                        mainState={mainState} 
                        setDatiFatturazione={setDatiFatturazione}
                        datiFatturazione={datiFatturazione}  
                    />
                </FormControl>
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
                                mainState={mainState}
                                setDatiFatturazione={setDatiFatturazione}
                                setStatusButtonConferma={setStatusButtonConferma}
                                datiFatturazione={datiFatturazione}
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
                                mainState={mainState} 
                                setDatiFatturazione={setDatiFatturazione}
                                datiFatturazione={datiFatturazione}
                            />
                        </div>
                    </Box>
                    {/* radio start */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(1, 2fr)' }}>
                        <div>
                            <TextFieldComponent
                                required={true}
                                helperText="Inserisci la PEC"
                                label="PEC"
                                placeholder="PEC"
                                fullWidth
                                value={datiFatturazione.pec}
                                keyObject='pec'
                                dataValidation={{max:15,validation:'Max 15 caratteri'}}
                                mainState={mainState}
                                setDatiFatturazione={setDatiFatturazione}
                                setStatusButtonConferma={setStatusButtonConferma}
                                datiFatturazione={datiFatturazione}
                                
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
                                    required={datiFatturazione.cup !== "" || datiFatturazione.codCommessa !== ""}
                                    helperText="max 20 caratteri alfanumerici e . / _ -"
                                    label="ID Documento"
                                    placeholder="Inserisci ID"
                                    fullWidth={false}
                                    value={datiFatturazione.idDocumento}
                                    keyObject='idDocumento'
                                    dataValidation={{max:20,validation:'Max 20 caratteri'}}
                                    mainState={mainState}
                                    setDatiFatturazione={setDatiFatturazione}
                                    setStatusButtonConferma={setStatusButtonConferma}
                                    datiFatturazione={datiFatturazione}
                                />
                            </div>
                            {/* id documento end */}
                            {/* data notifica start */}
                            <div>
                                <DataComponent 
                                    dataLabel="Data documento"
                                    formatDate="dd/MM/yyyy"
                                    mainState={mainState}
                                    datiFatturazione={datiFatturazione}
                                    setDatiFatturazione={setDatiFatturazione}
                                    setStatusButtonConferma={setStatusButtonConferma}
                                />
                            </div>
                            {/* data notifica end */}
                        </Box>
                        {/* commessa start */}
                        <div>
                            <TextFieldComponent
                                required={false}
                                helperText="max 100 caratteri alfanumerici e . / _ -"
                                label="Codice Commessa/Convenzione"
                                placeholder="Commessa/Convenzione"
                                fullWidth
                                value={datiFatturazione.codCommessa}
                                keyObject='codCommessa'
                                dataValidation={{max:100,validation:'Max 100 caratteri'}}
                                mainState={mainState}
                                setDatiFatturazione={setDatiFatturazione}
                                setStatusButtonConferma={setStatusButtonConferma}
                                datiFatturazione={datiFatturazione}
                            />
                        </div>
                        {/* commessa end */}
                        <div />
                    </Box>
                </div>
                {/* secondo box   end */}
                {/* terzo box   start */}
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 2fr)', marginTop: '30px' }}>
                    <Box sx={{ display: 'grid' }}>
               
                        <DynamicInsert status={mainState?.statusPageDatiFatturazione} arrElement={datiFatturazione.contatti} setData={setDatiFatturazione} mainState={mainState} datiFatturazione={datiFatturazione}/>
                
                    </Box>
                    <Box sx={{ display: 'grid'}}>
                        <TextFieldComponent
                            required
                            helperText="È il codice univoco necessario per ricevere le fatture elettroniche. Può essere del tuo ente o della sua Unità organizzativa di riferimento.(max 7 caratteri alfanumerici)"
                            label="Codice univoco o SDI"
                            placeholder="Codice univoco o SDI"
                            fullWidth={false}
                            value={datiFatturazione.codiceSDI||''}
                            keyObject='codiceSDI'
                            dataValidation={{max:7,validation:'Max 7 caratteri alfanumerici'}}
                            mainState={mainState}
                            setDatiFatturazione={setDatiFatturazione}
                            setStatusButtonConferma={setStatusButtonConferma}
                            datiFatturazione={datiFatturazione}
                            setOpenModalVerifica={setOpenModalVerifica}
                        />
                    </Box>
                </Box>
                {/*checkbox start */}
                <div className='d-flex marginTop24'>
                    <Typography sx={{marginRight:'10px', color:colorAsterisco}}  variant="h6">*</Typography>
               
                    <FormControlLabel  sx={{
                        '& .MuiFormControlLabel-label': {
                            fontSize: '0.8rem',
                       
                        },
                        '&.MuiFormControlLabel-root': {
                            marginLeft:'0',
                            marginRight:'0'
                        }
                    }}  
                
                    labelPlacement="start"
                    control={<Checkbox 
                        sx={{color: "#FE6666"}}
                        checked={datiFatturazione.notaLegale || false}
                        onChange={()=> setDatiFatturazione((prev)=>({...prev,...{notaLegale:!datiFatturazione.notaLegale}}))}/>}
                    disabled={mainState.statusPageDatiFatturazione === 'immutable' || datiFatturazione.tipoCommessa === ""}
                    label="Gli accordi di adesione a SEND sono esclusi dall'applicazione del Codice dei Contratti Pubblici ai
                 sensi dell'art. 56, comma 1, lett a) del D.lgs. 36/2023 pertanto non sono sottoposti alla disciplina della
                  tracciabilità dei flussi finanziari di cui alla L. 136/2010, come indicato dall'ANAC nelle relative Linee Guida.
                Conseguentemente, il CIG non deve essere acquisito e riportato nelle fatture"
                    />
                </div>
                {/*checkbox start */}
                <hr className="mx-3 mt-5" />
                <div className="d-flex justify-content-around marginTopBottom24">
                    <div className='d-flex'>
                        <InputLabel  sx={{ marginRight:'20px'}}  size={"normal"}>Data primo accesso</InputLabel>
                        {mainState.datiFatturazione && <Typography >{createDateFromString(mainState.profilo.dataPrimo)}</Typography>}
                    </div>
                    <div className='d-flex'>
                        <InputLabel sx={{ marginRight:'20px'}}  size={"normal"}>Data ultimo accesso</InputLabel>
                        {mainState.datiFatturazione && <Typography >{createDateFromString(mainState.profilo.dataUltimo)}</Typography>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TabAreaPersonaleUtente;

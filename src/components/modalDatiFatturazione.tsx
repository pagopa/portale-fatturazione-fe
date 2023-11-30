import {useState,useEffect} from 'react';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import { Box, InputLabel, Typography } from '@mui/material';
import RadioComponent from './radio';
import DataComponent from './data';
import DynamicInsert from './dynamicInsert';
import TextFieldComponent from './textField';
import { useNavigate } from 'react-router';
import { ModalDatiFatProps } from '../types/typeModuloCommessaInserimento';
import { DatiFatturazione } from '../types/typesAreaPersonaleUtenteEnte';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {useAxios, url, menageError} from '../api/api';

const style = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
};


const  ModalDatiFatturazione:React.FC<ModalDatiFatProps> = ({setOpenModalDatiFatturazione, openModalDatiFatturazione}) =>{
    const getToken = localStorage.getItem('token') || '{}';
    const token =  JSON.parse(getToken).token;
    const navigate = useNavigate();

    const [datiFatturazione, setDatiFatturazione] = useState<DatiFatturazione>({
        tipoCommessa:'',
        splitPayment:false,
        cup: '',
        cig:'',
        idDocumento:'',
        codCommessa:'',
        contatti:[],
        dataCreazione:'',
        dataModifica:'',
        dataDocumento:new Date().toISOString(),
        pec:''

    });

    const { ...getDatiFatturazione } = useAxios({
        method: 'GET',
        url: `${url}/api/datifatturazione/ente`,
        headers: {
            Authorization: 'Bearer ' + token
        }
    });

    useEffect(()=>{
        console.log(getDatiFatturazione.response,'ciaooooooo');
        if(getDatiFatturazione.response !== undefined){
            setDatiFatturazione(getDatiFatturazione.response);
        }
       
    },[getDatiFatturazione.response]);

    const valueOptionRadioTipoOrdine = [
        {descrizione:'Dati ordine d\'acquisto', id:"1"},
        {descrizione:'Dati contratto', id:"2"}
    ];

    const valueOptionRadioSplitPayment = [
        {descrizione:'Si', id: true},
        {descrizione:'No', id: false},
    ];

    function createDateFromString(string:string){
        const getGiorno = new Date(string).getDate();
        const getMese = new Date(string).getMonth();
        const getAnno = new Date(string).getFullYear();

        return getGiorno+'/'+getMese+'/'+getAnno;
    }

    const getProfilo =  localStorage.getItem('profilo') || '{}';
    const parseProfilo = JSON.parse(getProfilo);
   

    const handleClose = () => setOpenModalDatiFatturazione(false);

    const handleEsci = () =>{
        navigate('/');
    };
    return(
        <div>
            <Modal
                open={openModalDatiFatturazione}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
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
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 2fr)', marginTop: '30px' }}>
                                {/* CUP start */}
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
                                {/* CIG start */}
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
                                {/* CIG end */}
                                {/* radio start  */}
                                <div>
                                    <RadioComponent
                                        valueRadio={datiFatturazione.splitPayment}
                                        label="Split Paymet"
                                        options={valueOptionRadioSplitPayment}
                                        keyObject='splitPayment'
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
                                        value={datiFatturazione.pec}
                                        keyObject='pec'
                                        dataValidation={{max:15,validation:'Max 15 caratteri'}}
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
                                                value={datiFatturazione.idDocumento}
                                                keyObject='idDocumento'
                                                dataValidation={{max:20,validation:'Max 20 caratteri'}}
                                            />
                                        </div>
                                        {/* id documento end */}
                                        {/* data notifica start */}
                                        <div>
                                            <div>
                                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                                    <DesktopDatePicker
                                                        label="Data documento"
                                                        format="dd/MM/yyyy"
                                                        value={new Date(datiFatturazione.dataDocumento)}
                                                       
                                                        disabled={true}
                                                        slotProps={{
                                                            textField: {
                                                                inputProps: {
                                                                    placeholder: 'dd/mm/aaaa',
                                                                },
                                                            },
                                                        }}
                                                    />
                                                </LocalizationProvider>
                                            </div>
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
                                <DynamicInsert status={'immutable'} arrElement={datiFatturazione.contatti} setData={setDatiFatturazione} />
                            </div>

                            {/* terzo box   end */}
                            <hr className="mx-3 mt-5" />
                            <div className="d-flex justify-content-around marginTopBottom24">
                                <div className='d-flex'>
                                    <InputLabel  sx={{ marginRight:'20px'}}  size={"normal"}>Data primo accesso</InputLabel>
                                    <Typography >{createDateFromString(parseProfilo.dataPrimo)}</Typography>
                                </div>

                                <div className='d-flex'>
                                    <InputLabel sx={{ marginRight:'20px'}}  size={"normal"}>Data ultimo accesso</InputLabel>
                                    <Typography >{createDateFromString(parseProfilo.dataUltimo)}</Typography>
                        
                                </div>
        
        
                            </div>

                        </div>

                    </div>
                  
                    <div className='container_buttons_modal d-flex justify-content-end'>
                        <Button 
                            sx={{marginRight:'20px'}} 
                            variant='outlined'
                            onClick={()=>handleClose()}
                        >Annulla</Button>
                        <Button
                            variant='contained'
                            onClick={()=>handleEsci()}
                        >Esci</Button>
                    </div>
                    
                </Box>
                
            </Modal>
        </div>
    );
}; 
export default ModalDatiFatturazione;
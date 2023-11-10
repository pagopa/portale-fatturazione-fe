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
    tipoCommessa:string,
    splitPayment:boolean,
    cup: string,
    cig:string,
    idDocumento:string,
    codCommessa:string,
    contatti: Contatti[],
    dataCreazione:string,
    dataModifica:string,
    dataDocumento:string,
    pec:string,
}


const TabAreaPersonaleUtente : React.FC<TabAreaPesonaleProps> = (props) => {

    const {statusPage } = props;

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
        dataDocumento:'',
        pec:'>'

    });




    const getDatiFatturazione  = async () => {
        const response = await axios.get(
            `https://portalefatturebeapi20231102162515.azurewebsites.net/api/datifatturazione/ente/176f304b-d5d5-4cb8-a99a-45937c3df238`).then( (res) => {
            setDatiFatturazione(res.data);
      
            console.log(res.data, 'CICCIO');
            return res.data;
        });
        return response;
    };

    function createDateFromString(string:string){
        const getGiorno = new Date(string).getDate();
        const getMese = new Date(string).getMonth();
        const getAnno = new Date(string).getFullYear();

        return getGiorno+'/'+getMese+'/'+getAnno;
    }


    
   
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
  
    const [split, setSplit] = useState();
    const [dataDocumento, setDataDocumento] = useState(new Date());
   

    return (

        <div className="ms-5 me-5 mb-5  bg-white rounded">

            <div className="ms-4  me-4 pt-4 marginTop24">

                <div>
                    <RadioComponent
                        options={valueOptionRadioTipoOrdine}
                        status={statusPage}
                        valueRadio={datiFatturazione.tipoCommessa}
                        setDatiFatturazione={setDatiFatturazione}
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
                            status={statusPage}
                            value={datiFatturazione.cup}
                            setDatiFatturazione={setDatiFatturazione}
                            keyObject='cup'
             
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
                            setDatiFatturazione={setDatiFatturazione}
                            keyObject='cig'
             
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
                            value={datiFatturazione.pec}
                            setDatiFatturazione={setDatiFatturazione}
                            keyObject='pec'

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
                                    setDatiFatturazione={setDatiFatturazione}
                                    keyObject='idDocumento'
                                />
                            </div>
                            {/* id documento end */}
                            {/* data notifica start */}
                            <div>
                                <DataComponent 
                                    dataLabel="Data documento"
                                    formatDate="dd/MM/yyyy"
                                    status={statusPage} 
                                    children={datiFatturazione.dataDocumento}
                                    data={dataDocumento || new Date()}
                                    setData={setDataDocumento}
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
                                status={statusPage}
                                value={datiFatturazione.codCommessa}
                                setDatiFatturazione={setDatiFatturazione}
                                keyObject='codCommessa'
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
                <hr className="mx-3 mt-5" />
                <div className="d-flex justify-content-around marginTopBottom24">
                    <div className='d-flex'>
                        <InputLabel  sx={{ marginRight:'20px'}}  size={"normal"}>Data primo accesso</InputLabel>
                        <Typography >{createDateFromString(datiFatturazione.dataCreazione)}</Typography>
                    </div>

                    <div className='d-flex'>
                        <InputLabel sx={{ marginRight:'20px'}}  size={"normal"}>Data ultimo accesso</InputLabel>
                        <Typography >{createDateFromString(datiFatturazione.dataModifica)}</Typography>
                    </div>
        
        
                </div>

            </div>

        </div>
    );
};

export default TabAreaPersonaleUtente;

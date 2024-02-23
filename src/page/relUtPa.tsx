import React, { useState } from "react";
import SelectUltimiDueAnni from "../components/reusableComponents/selectUltimiDueAnni";
import SelectMese from "../components/reusableComponents/selectMese";
import { Button, TablePagination, Typography } from "@mui/material";
import SelectTipologiaFattura from "../components/rel/selectTipologiaFattura";
import TextRagioneSociale from "../components/rel/textFieldRegSociale";
import GridCustom from "../components/reusableComponents/gridCustom";
import { BodyRel, RelPageProps } from "../types/typeRel";
import MultiselectCheckbox from "../components/reportDettaglio/multiSelectCheckbox";


const RelPage : React.FC<RelPageProps> = ({mainState}) =>{

    const getProfilo = localStorage.getItem('profilo') || '{}';
    const profilo =  JSON.parse(getProfilo);

    const currentYear = (new Date()).getFullYear();


    const currentMonth = (new Date()).getMonth() + 1;
    const month = Number(currentMonth);


    

    const [bodyRel, setBodyRel] = useState<BodyRel>({
        anno:currentYear,
        mese:month,
        tipologiaFatture:null,
        ragioneSociale:[],
        idContratto:null,
        page:0,
        pageSize:0
    });

    // data ragione sociale
    const [dataSelect, setDataSelect] = useState([]);

    const [data, setData] = useState([{
        "idEnte": "08b735d2-1a95-45e1-bd50-b8fb3fa73224",
        "ragioneSociale": "Comune di Chiavari",
        "profilo": "PA",
        "idContratto": "460ed965-b93b-4755-bdbe-89b8a40207d6",
        "codiceFiscale": "ND",
        "pIva": "ND",
        "cap": null,
        "statoEstero": null,
        "numberOfPages": null,
        "gEnvelopeWeight": null,
        "costEuroInCentesimi": "100",
        "timelineCategory": "NOTIFICATION_VIEWED",
        "contestazione": "Accettata",
        "statoContestazione": 8,
        "tipoNotifica": "Digitale",
        "idNotifica": "NOTIFICATION_VIEWED.IUN_DHZG-PVEQ-AXEG-202310-L-1.RECINDEX_0",
        "iun": "DHZG-PVEQ-AXEG-202310-L-1",
        "consolidatore": null,
        "recapitista": null,
        "dataInvio": "2023-10-26T09:13:46.966232253Z",
        "data": "2023-10-26T12:39:03.140204475Z",
        "recipientIndex": "0",
        "recipientType": 0,
        "recipientId": 0,
        "anno": "2024",
        "mese": "1",
        "annoMeseGiorno": "20240126",
        "itemCode": "",
        "notificationRequestId": "",
        "recipientTaxId": "",
        "fatturata": false,
        "onere": "SEND_PA"
    }]);

    // elemento selezionato nella grid
    const [rel, setRel] = useState({});

       
   

 


    return (

       
        <div className="mx-5">
            <div className="marginTop24">
                <Typography variant="h4">Rel</Typography>
            </div>
            <div className="marginTop24">
                <div className="row">
                    <div className="col-3">
                        <SelectUltimiDueAnni values ={bodyRel} setValue={setBodyRel}></SelectUltimiDueAnni>
                    </div>
                    <div  className="col-3">
                        <SelectMese values ={bodyRel} setValue={setBodyRel}></SelectMese>
                    </div>
                    <div  className="col-3">
                        <SelectTipologiaFattura values ={bodyRel} setValue={setBodyRel}></SelectTipologiaFattura>
                    </div>
                    { profilo.auth === 'PAGOPA' &&
                        <div  className="col-3">
                            <MultiselectCheckbox 
                                mainState={mainState} 
                                setBodyGetLista={setBodyRel}
                                setDataSelect={setDataSelect}
                                dataSelect={dataSelect}
                            ></MultiselectCheckbox>
                        </div>
                    }
                  
                   
                    
                </div>
                
                <div className="row mt-5">
                    
                    <div className="col-1">
                        <Button  variant="contained">Filtra</Button>
                    </div>
                    <div className="col-2">
                        <Button >Annulla Filtri</Button>
                    </div>
                </div>
                <div className="mt-5">
                    <div  style={{overflowX:'auto'}}>
                        <GridCustom elements={data} elementSelected={rel} setElementSelected={setRel} mainState={mainState} body={bodyRel} setBody={setBodyRel}></GridCustom>
                    </div>
                </div>
               
               
            
            </div>
            
               


        </div>


    );
};

export default RelPage;
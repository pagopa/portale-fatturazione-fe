import React, { useState } from "react";
import SelectUltimiDueAnni from "../components/reusableComponents/selectUltimiDueAnni";
import SelectMese from "../components/reusableComponents/selectMese";
import { Button, TablePagination, Typography } from "@mui/material";
import SelectTipologiaFattura from "../components/rel/selectTipologiaFattura";
import TextRagioneSociale from "../components/rel/textFieldRegSociale";
import GridCustom from "../components/reusableComponents/gridCustom";
import { BodyRel } from "../types/typeRel";


const RelPage : React.FC = () =>{

    const getProfilo = localStorage.getItem('profilo') || '{}';
    const profilo =  JSON.parse(getProfilo);

    const currentYear = (new Date()).getFullYear();

    const [bodyRel, setBodyRel] = useState<BodyRel>({
        anno:currentYear,
        mese:null,
        tipologiaFatture:null,
        ragioneSociale:''
    });

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
    const [rel, setRel] = useState({});

       
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalNotifiche, setTotalNotifiche]  = useState(0);

    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number,
    ) => {
     
        const realPage = newPage + 1;
        if(profilo.auth === 'SELFCARE'){
            // getlistaNotifiche(realPage,rowsPerPage);
            
        }
        if(profilo.auth === 'PAGOPA'){
            // getlistaNotifichePagoPa(realPage,rowsPerPage);
            //listaEntiNotifichePageOnSelect();
        }
        setPage(newPage);
    };
                    
    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
    
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
        const realPage = page + 1;

        if(profilo.auth === 'SELFCARE'){
            //  getlistaNotifiche(realPage,parseInt(event.target.value, 10));
            
        }
        if(profilo.auth === 'PAGOPA'){
            // getlistaNotifichePagoPa(realPage,parseInt(event.target.value, 10));
            //listaEntiNotifichePageOnSelect();
        }
                            
    };


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
                    <div  className="col-3">
                        <TextRagioneSociale values ={bodyRel} setValue={setBodyRel}></TextRagioneSociale>
                    </div>
                   
                    
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
                        <GridCustom elements={data} elementSelected={rel} setElementSelected={setRel}></GridCustom>
                    </div>
                </div>
               
                <div className="pt-3">
                                                    
                    <TablePagination
                        sx={{'.MuiTablePagination-selectLabel': {
                            display:'none',
                            backgroundColor:'#f2f2f2'
                                                           
                        }}}
                        component="div"
                        page={page}
                        count={totalNotifiche}
                        rowsPerPage={rowsPerPage}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />  
                </div>
            
            </div>
            
               


        </div>


    );
};

export default RelPage;
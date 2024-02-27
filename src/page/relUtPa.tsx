import React, { useEffect, useState } from "react";
import SelectUltimiDueAnni from "../components/reusableComponents/selectUltimiDueAnni";
import SelectMese from "../components/reusableComponents/selectMese";
import { Button, TablePagination, Typography } from "@mui/material";
import SelectTipologiaFattura from "../components/rel/selectTipologiaFattura";
import TextRagioneSociale from "../components/rel/textFieldRegSociale";
import GridCustom from "../components/reusableComponents/gridCustom";
import { BodyRel, RelPageProps } from "../types/typeRel";
import MultiselectCheckbox from "../components/reportDettaglio/multiSelectCheckbox";
import { getListaRel, manageError } from "../api/api";
import { useNavigate } from "react-router";


const RelPage : React.FC<RelPageProps> = ({mainState, setMainState}) =>{

    const mesiGrid = ["Dicembre", "Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];

    const navigate = useNavigate();

    const getToken = localStorage.getItem('token') || '{}';
    const token =  JSON.parse(getToken).token;

    const getProfilo = localStorage.getItem('profilo') || '{}';
    const profilo =  JSON.parse(getProfilo);

    const currentYear = (new Date()).getFullYear();


    const currentMonth = (new Date()).getMonth() + 1;
    const month = Number(currentMonth);


    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalNotifiche, setTotalNotifiche]  = useState(0);




    const headerNamesGrid = ['Rag. Sociale','Tipologia Fattura','Anno','Mese','Tot. Analogico','Tot. Digitale','Tot. Not. Analogico','Tot. Not. Digitali','Totale',''];    

    const [bodyRel, setBodyRel] = useState<BodyRel>({
        anno:currentYear,
        mese:month,
        tipologiaFatture:null,
        ragioneSociale:[],
        idContratto:null
    });

    // data ragione sociale
    const [dataSelect, setDataSelect] = useState([]);

    const [data, setData] = useState([]);


       
    



  
    useEffect(()=>{
        getlistaRelEnte(page, rowsPerPage);
    },[page, rowsPerPage]);

   

    const getlistaRelEnte = async (nPage,nRows) => {

        if(profilo.auth === 'SELFCARE'){
            const {ragioneSociale, ...newBody} = bodyRel;
     
      
            await  getListaRel(token,mainState.nonce,nPage, nRows, newBody)
                .then((res)=>{
                    // ordino i dati in base all'header della grid
                    const orderDataCustom = res.data.relTestate.map((obj)=>{

                        // inserire come prima chiave l'id se non si vuol renderlo visibile nella grid
                        // 'id serve per la chiamata get dettaglio dell'elemento selezionato nella grid
                        return {
                            idTestata:obj.idTestata,
                            //idContratto:obj.idContratto,
                            ragioneSociale:obj.ragioneSociale,
                            tipologiaFattura:obj.tipologiaFattura,
                            anno:obj.anno,
                            mese:mesiGrid[obj.mese],
                            totaleAnalogico:obj.totaleAnalogico,
                            totaleDigitale:obj.totaleDigitale,
                            totaleNotificheAnalogiche:obj.totaleNotificheAnalogiche,
                            totaleNotificheDigitali:obj.totaleNotificheDigitali,
                            totale:obj.totale
                        };
                    });
                    
                    setData(orderDataCustom);
                    setTotalNotifiche(res.data.count);
                }).catch((error)=>{
                    
                    manageError(error, navigate);
                });
        }

       
                    
    };


    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number,
    ) => {
     
        const realPage = newPage + 1;
        if(profilo.auth === 'SELFCARE'){
            getlistaRelEnte(page, rowsPerPage);
            
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
                        <Button onClick={()=>{
                            getlistaRelEnte(page, rowsPerPage);
                        }} variant="contained">Filtra</Button>
                    </div>
                    <div className="col-2">
                        <Button >Annulla Filtri</Button>
                    </div>
                </div>
                <div className="mt-5 mb-5">
                    
                    <GridCustom
                        nameParameterApi='idTestata'
                        elements={data}
                        changePage={handleChangePage}
                        changeRow={handleChangeRowsPerPage} 
                        total={totalNotifiche}
                        page={page}
                        rows={rowsPerPage}
                        headerNames={headerNamesGrid}
                        setMainState={setMainState}></GridCustom>
                 
                </div>
           
            </div>
      
        </div>


    );
};

export default RelPage;
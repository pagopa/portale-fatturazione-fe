import React, { useEffect, useState } from "react";
import SelectUltimiDueAnni from "../components/reusableComponents/selectUltimiDueAnni";
import SelectMese from "../components/reusableComponents/selectMese";
import { Button, Typography } from "@mui/material";
import SelectTipologiaFattura from "../components/rel/selectTipologiaFattura";
import GridCustom from "../components/reusableComponents/gridCustom";
import { BodyRel, Rel, RelPageProps } from "../types/typeRel";
import MultiselectCheckbox from "../components/reportDettaglio/multiSelectCheckbox";
import { manageError} from "../api/api";
import { useNavigate } from "react-router";
import { MainState } from "../types/typesGeneral";
import ModalRedirect from "../components/commessaInserimento/madalRedirect";
import DownloadIcon from '@mui/icons-material/Download';
import { downloadListaRel, getListaRel, getSingleRel } from "../api/apiSelfcare/relSE/api";
import { downloadListaRelPagopa, getListaRelPagoPa, getSingleRelPagopa } from "../api/apiPagoPa/relPA/api";


const RelPage : React.FC<RelPageProps> = ({mainState, dispatchMainState}) =>{

    const mesiGrid = ["Dicembre", "Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];

    const navigate = useNavigate();

    const getToken = localStorage.getItem('token') || '{}';
    const token =  JSON.parse(getToken).token;

    const getProfilo = localStorage.getItem('profilo') || '{}';
    const profilo =  JSON.parse(getProfilo);

    const handleModifyMainState = (valueObj) => {
        dispatchMainState({
            type:'MODIFY_MAIN_STATE',
            value:valueObj
        });
    };

    const currentYear = (new Date()).getFullYear();


    const currentMonth = (new Date()).getMonth() + 1;
    const month = Number(currentMonth);


   




    
    const [bodyRel, setBodyRel] = useState<BodyRel>({
        anno:currentYear,
        mese:month,
        tipologiaFattura:null,
        idEnti:[],
        idContratto:null
    });

    const  hiddenAnnullaFiltri = bodyRel.tipologiaFattura === null ; 


    // data ragione sociale

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalNotifiche, setTotalNotifiche]  = useState(0);
       
    const [dataSelect, setDataSelect] = useState([]);
   
    const headerNamesGrid = ['Ragione Sociale','Tipologia Fattura', 'ID Contratto','Anno','Mese','Tot. Analogico','Tot. Digitale','Tot. Not. Analogico','Tot. Not. Digitali','Totale',''];    
   
    const [data, setData] = useState([]);

   

    const getlistaRelEnte = async (nPage,nRows) => {

        if(profilo.auth === 'SELFCARE'){
            const {idEnti, ...newBody} = bodyRel;
     
      
            await  getListaRel(token,profilo.nonce,nPage, nRows, newBody)
                .then((res)=>{
                    // ordino i dati in base all'header della grid
                    const orderDataCustom = res.data.relTestate.map((obj)=>{

                        // inserire come prima chiave l'id se non si vuol renderlo visibile nella grid
                        // 'id serve per la chiamata get dettaglio dell'elemento selezionato nella grid
                        return {
                            idTestata:obj.idTestata,
                            ragioneSociale:obj.ragioneSociale,
                            tipologiaFattura:obj.tipologiaFattura,
                            idContratto:obj.idContratto,
                            anno:obj.anno,
                            mese:mesiGrid[obj.mese],
                            totaleAnalogico:Number(obj.totaleAnalogico).toFixed(2)+' €',
                            totaleDigitale:Number(obj.totaleDigitale).toFixed(2)+' €',
                            totaleNotificheAnalogiche:obj.totaleNotificheAnalogiche,
                            totaleNotificheDigitali:obj.totaleNotificheDigitali,
                            totale:Number(obj.totale).toFixed(2)+' €'
                        };
                    });
                    
                    setData(orderDataCustom);
                    setTotalNotifiche(res.data.count);
                }).catch((error)=>{
                    
                    manageError(error, navigate);
                });
        }else{
            await  getListaRelPagoPa(token,profilo.nonce,nPage, nRows, bodyRel)
                .then((res)=>{
                // ordino i dati in base all'header della grid
                    const orderDataCustom = res.data.relTestate.map((obj)=>{

                        // inserire come prima chiave l'id se non si vuol renderlo visibile nella grid
                        // 'id serve per la chiamata get dettaglio dell'elemento selezionato nella grid
                        return {
                            idTestata:obj.idTestata,
                            ragioneSociale:obj.ragioneSociale,
                            tipologiaFattura:obj.tipologiaFattura,
                            idContratto:obj.idContratto,
                            anno:obj.anno,
                            mese:mesiGrid[obj.mese],
                            totaleAnalogico:Number(obj.totaleAnalogico).toFixed(2)+' €',
                            totaleDigitale:Number(obj.totaleDigitale).toFixed(2)+' €',
                            totaleNotificheAnalogiche:obj.totaleNotificheAnalogiche,
                            totaleNotificheDigitali:obj.totaleNotificheDigitali,
                            totale:Number(obj.totale).toFixed(2)+' €'
                        };
                    });
                
                    setData(orderDataCustom);
                    setTotalNotifiche(res.data.count);
                }).catch((error)=>{
                
                    manageError(error, navigate);
                });
        }            
    };

    useEffect(()=>{
        const realPage = page + 1;
        getlistaRelEnte(realPage, rowsPerPage);
    },[page, rowsPerPage]);


    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number,
    ) => {
     
        const realPage = newPage + 1;
        if(profilo.auth === 'SELFCARE'){
            getlistaRelEnte(realPage, rowsPerPage);
            
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
            getlistaRelEnte(realPage,parseInt(event.target.value, 10));
        }
        if(profilo.auth === 'PAGOPA'){
           
            // getlistaNotifichePagoPa(realPage,parseInt(event.target.value, 10));
            //listaEntiNotifichePageOnSelect();
        }
                            
    };
  


    // visulizzazione del pop up redirect dati di fatturazione
    const [openModalRedirect, setOpenModalRedirect] = useState(false);
   
    const getRel = async(idRel) => {

        if(profilo.auth === 'SELFCARE'){
            getSingleRel(token,profilo.nonce,idRel).then((res) =>{
                handleModifyMainState({relSelected:res.data});
               
                if(res.data.datiFatturazione === true){
                    navigate('/relpdf');
                }else{
                    setOpenModalRedirect(false);
                }
            }).catch((err)=>{
                manageError(err, navigate);
            }
              
            );
        }else{
            getSingleRelPagopa(token,profilo.nonce,idRel).then((res) =>{
                handleModifyMainState({relSelected:res.data});
                if(res.data.datiFatturazione === true){
                    navigate('/relpdf');
                }else{
                    setOpenModalRedirect(false);
                }
            }).catch((err)=>{
                manageError(err, navigate);
            }
              
            );
        }
       
        
    };  

    

  


    const downloadListaRelExel = async() =>{

        if(profilo.auth === 'SELFCARE'){

            const {idEnti, ...newBody} = bodyRel;
            await downloadListaRel(token,profilo.nonce,newBody).then((res)=>{
                const link = document.createElement('a');
                link.href = "data:text/plain;base64," + res.data.documento;
                link.setAttribute('download', `Lista Regolare esecuzione mese di riferimento ${mesiGrid[bodyRel.mese]}.xlsx`); //or any other extension
                document.body.appendChild(link);
              
                link.click();
                document.body.removeChild(link);
           
            }).catch((err)=>{
                console.log(err);
            }); 
        }else{
            await downloadListaRelPagopa(token,profilo.nonce,bodyRel).then((res)=>{
                const link = document.createElement('a');
                link.href = "data:text/plain;base64," + res.data.documento;
                link.setAttribute('download', `Lista Regolare esecuzione mese di riferimento ${mesiGrid[bodyRel.mese]}.xlsx`); //or any other extension
                document.body.appendChild(link);
              
                link.click();
                document.body.removeChild(link);
           
            }).catch((err)=>{
                console.log(err);
            }); 
            
        }

        
    };
 


    return (

       
        <div className="mx-5">
            <div className="marginTop24 ">
                <Typography variant="h4">Regolare Esecuzione</Typography>
            </div>
            <div className="mt-5">
                <div className="row">
                    <div className="col-3">
                        <SelectUltimiDueAnni values ={bodyRel} setValue={setBodyRel}></SelectUltimiDueAnni>
                    </div>
                    <div  className="col-3">
                        <SelectMese values={bodyRel} setValue={setBodyRel}></SelectMese>
                    </div>
                    <div  className="col-3">
                        <SelectTipologiaFattura values={bodyRel} setValue={setBodyRel}></SelectTipologiaFattura>
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
                            const realPage = page + 1;
                            getlistaRelEnte(realPage, rowsPerPage);
                        }} variant="contained">Filtra</Button>
                    </div>
                    {!hiddenAnnullaFiltri && 
                    <div className="col-2">
                        <Button onClick={()=>{
                            setBodyRel({
                                anno:currentYear,
                                mese:month,
                                tipologiaFattura:null,
                                idEnti:[],
                                idContratto:null
                            });
                            setData([]);
                        }} >Annulla Filtri</Button>
                    </div>
                    }
                </div>
                <div className="mt-5 mb-5">
                    { data.length > 0  &&
            <div className="marginTop24" style={{display:'flex', justifyContent:'end'}}>
                 
                <div>
                    <Button
                        disabled={false}
                        onClick={()=> {
                            downloadListaRelExel();
                          
                        }}  >
                                  Download Risultati 
                        <DownloadIcon sx={{marginRight:'10px'}}></DownloadIcon>
                    </Button>
            
                </div>           
                   
               
               
            </div>
                    }    
                    
                    <GridCustom
                        nameParameterApi='idTestata'
                        elements={data}
                        changePage={handleChangePage}
                        changeRow={handleChangeRowsPerPage} 
                        total={totalNotifiche}
                        page={page}
                        rows={rowsPerPage}
                        headerNames={headerNamesGrid}
                        apiGet={getRel}></GridCustom>
                 
                </div>
           
            </div>
            <ModalRedirect
                setOpen={setOpenModalRedirect} 
                open={openModalRedirect}
                sentence={`Per poter visulazzare il dettaglio REL è nesessario l'inserimento dei dati di fatturazione obbligatori:`}></ModalRedirect>
      
        </div>


    );
};

export default RelPage;
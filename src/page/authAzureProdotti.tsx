import { useNavigate } from "react-router";
import { getAuthProfilo, redirect } from "../api/api";
import MultipleSelectProdotti from "../components/authSelectProdottiPa/selectProdotti";
import { PathPf } from "../types/enum";
import { ProfiloObject } from "../types/typesGeneral";
import { useContext, useState } from "react";
import { Button, Typography } from "@mui/material";
import DivProdotto from "../components/authSelectProdottiPa/divProdotto";
import { GlobalContext } from "../store/context/globalContext";
import Loader from "../components/reusableComponents/loader";
import { getMessaggiCount } from "../api/apiPagoPa/centroMessaggi/api";

const AuthAzureProdotti : React.FC = () => {

    const globalContextObj = useContext(GlobalContext); 
    const {dispatchMainState,setCountMessages } = globalContextObj;
    const navigate = useNavigate();

    const [productSelected, setProductSelected] = useState<ProfiloObject|null>(null);
    const [loading, setLoading] = useState(false);
   

    const handleModifyMainState = (valueObj) => {
        dispatchMainState({
            type:'MODIFY_MAIN_STATE',
            value:valueObj
        });
    };

    const getCount = async (token,nonce) =>{
        await getMessaggiCount(token,nonce).then((res)=>{
            const numMessaggi = res.data;
            setCountMessages(numMessaggi);
        }).catch((err)=>{
            console.log(err);
        });
    };

    const getProfilo = async ()=>{
        
        if(productSelected?.jwt){
            setLoading(true);
            await getAuthProfilo(productSelected.jwt)
                .then((resp) => {
                    const storeProfilo = resp.data;
                    const profiloDetails = {
                        auth:storeProfilo.auth,
                        nomeEnte:storeProfilo.nomeEnte,
                        descrizioneRuolo:storeProfilo.descrizioneRuolo,
                        ruolo:storeProfilo.ruolo,
                        dataUltimo:storeProfilo.dataUltimo,
                        dataPrimo:storeProfilo.dataPrimo,
                        prodotto:storeProfilo.prodotto,
                        jwt:productSelected.jwt,
                        nonce:storeProfilo.nonce
                        
                    };
                    //const storeJwt = {token:productSelected.jwt};
                    //localStorage.setItem('token', JSON.stringify(storeJwt));
                    //eliminare il nonce
                    handleModifyMainState({
                        ruolo:resp.data.ruolo,
                        action:'LISTA_DATI_FATTURAZIONE',
                        authenticated:true,
                        profilo:profiloDetails
                    });

                    getCount(productSelected.jwt,storeProfilo.nonce);
                    if(productSelected.prodotto === 'prod-pagopa'){
                        navigate(PathPf.ANAGRAFICAPSP);
                    }else if(productSelected.prodotto === 'prod-pn'){
                        navigate(PathPf.LISTA_DATI_FATTURAZIONE);
                    }
                    setLoading(false);
                }).catch(()=> {
                    setLoading(false);
                    window.location.href = redirect;
                });
        }
    };

    return (
        <div style={{height: '600px',marginTop:'100px'}}>
            <div className="row">
                <div className="col">
                </div>
                <div className="col">
                    <div className=" d-flex align-items-center justify-content-center">
                        <Typography variant="h2">Seleziona il prodotto</Typography>
                    </div>
                    <div className=" d-flex align-items-center justify-content-center mt-2">
                        <Typography  align="center">{`Se operi per più prodotti, potrai modificare la tua scelta dopo aver effettuato l’accesso.`}</Typography>                                                               
                    </div>
                    {!productSelected? 
                        <div className=" d-flex align-items-center justify-content-center mt-5">
                            <MultipleSelectProdotti  setProductSelected={setProductSelected}></MultipleSelectProdotti>
                        </div> :
                        <div className=" d-flex align-items-center justify-content-center mt-5">
                            <DivProdotto productSelected={productSelected} setProductSelected={setProductSelected}/>
                        </div>
                    }
                </div>
                <div className="col">
                </div>
            </div>
            {productSelected && 
                <div className="row mt-3">

                    <div className="col">
                    </div>
                    <div className="col">
                        {!loading ? <div className=" d-flex align-items-center justify-content-center mt-5">
                            <Button variant="contained" onClick={()=> getProfilo()}>Accedi</Button>
                        </div>:
                            <div className="d-flex justify-content-center align-items-center mt-5">
                                <div id='loader_on_gate_pages'>
                                    <Loader sentence={'Attendere...'}></Loader> 
                                </div>
                            </div>}
                    </div>
                    <div className="col">
                    </div>
                </div>
            }
        </div>
    );
};

export default AuthAzureProdotti;



import { useNavigate } from "react-router";
import { getAuthProfilo, redirect } from "../api/api";
import MultipleSelectProdotti from "../components/authSelectProdottiPa/selectProdotti";
import { PathPf } from "../types/enum";
import { AuthAzureProps, ProfiloObject } from "../types/typesGeneral";
import { useEffect, useState } from "react";
import { getProdotti } from "../reusableFunction/actionLocalStorage";
import { Button, Typography } from "@mui/material";
import DivProdotto from "../components/authSelectProdottiPa/divProdotto";

const AuthAzureProdotti : React.FC<AuthAzureProps> = ({dispatchMainState}) => {

    const navigate = useNavigate();
    const prodotti = getProdotti().prodotti;

    const [productSelected, setProductSelected] = useState<ProfiloObject|null>(null);
   

    const handleModifyMainState = (valueObj) => {
        dispatchMainState({
            type:'MODIFY_MAIN_STATE',
            value:valueObj
        });
    };

   

    useEffect(()=>{
        if(prodotti?.length > 0){
            handleModifyMainState({
                authenticated:true,
                prodotti:prodotti
            });
        }
    },[]);
  

    const getProfilo = async ()=>{
        if(productSelected?.jwt){

      
            await getAuthProfilo(productSelected.jwt)
                .then(resp =>{
               
                    const storeProfilo = resp.data;
                    localStorage.setItem('profilo', JSON.stringify({
                        auth:storeProfilo.auth,
                        nomeEnte:storeProfilo.nomeEnte,
                        descrizioneRuolo:storeProfilo.descrizioneRuolo,
                        ruolo:storeProfilo.ruolo,
                        dataUltimo:storeProfilo.dataUltimo,
                        dataPrimo:storeProfilo.dataPrimo,
                        prodotto:storeProfilo.prodotto,
                        jwt:productSelected.jwt,
                        nonce:storeProfilo.nonce
                    }));
                    const storeJwt = {token:productSelected.jwt};
                    localStorage.setItem('token', JSON.stringify(storeJwt));

                    handleModifyMainState({
                        ruolo:resp.data.ruolo,
                        action:'LISTA_DATI_FATTURAZIONE',
                        nonce:storeProfilo.nonce,
                        authenticated:true
                    });

                   
                    if(productSelected.prodotto === 'prod-pagopa'){
                        navigate(PathPf.ANAGRAFICAPSP);
                    }else if(productSelected.prodotto === 'prod-pn'){
                        navigate(PathPf.LISTA_DATI_FATTURAZIONE);
                    }

                } )
                .catch(()=> {
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
                            <MultipleSelectProdotti productSelected={productSelected} setProductSelected={setProductSelected}></MultipleSelectProdotti>
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
                    <div className=" d-flex align-items-center justify-content-center mt-5">
                        <Button variant="contained" onClick={()=> getProfilo()}>Accedi</Button>
                    </div>
                </div>
                <div className="col">
                </div>
            </div>
            }
            

      
            
            
        </div>
    );
};

export default AuthAzureProdotti;

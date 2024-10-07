import { useNavigate } from "react-router";
import { getAuthProfilo, redirect } from "../api/api";
import MultipleSelectProdotti from "../components/authSelectProdottiPa/selectProdotti";
import { PathPf } from "../types/enum";
import { AuthAzureProps, ProfiloObject } from "../types/typesGeneral";
import { useEffect, useState } from "react";
import { getProdotti } from "../reusableFunction/actionLocalStorage";
import { Button, Typography } from "@mui/material";


type  Jwt = {
    jwt:string
}
interface ParameterGetProfiloAzure {
    data:Jwt
}

const AuthAzureProdotti : React.FC<AuthAzureProps> = ({dispatchMainState}) => {

    const navigate = useNavigate();
    const prodotti = getProdotti().prodotti;

    const [productSelected, setProductSelected] = useState<ProfiloObject|object>({});
    console.log(productSelected);

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
  

    const getProfilo = async (res:ParameterGetProfiloAzure)=>{
      
        await getAuthProfilo(res.data.jwt)
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
                    jwt:res.data.jwt,
                    nonce:storeProfilo.nonce
                }));
              
                handleModifyMainState({
                    ruolo:resp.data.ruolo,
                    action:'LISTA_DATI_FATTURAZIONE',
                    nonce:storeProfilo.nonce,
                    authenticated:true});

                navigate(PathPf.LISTA_DATI_FATTURAZIONE);
              
            } )
            .catch(()=> {
                window.location.href = redirect;
            });
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
                    <div className=" d-flex align-items-center justify-content-center mt-5">
                     
                        <MultipleSelectProdotti setProductSelected={setProductSelected}></MultipleSelectProdotti>
                        
                    </div>
                </div>
                <div className="col">
                </div>
            </div>
            <div className="row mt-3">

                <div className="col">
                </div>
                <div className="col">
                    <div className=" d-flex align-items-center justify-content-center mt-2">
                        <Button variant="contained" >Accedi</Button>
                    </div>
                </div>
                <div className="col">
                </div>
            </div>
            

      
            
            
        </div>
    );
};

export default AuthAzureProdotti;

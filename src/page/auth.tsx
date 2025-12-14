import { useSearchParams, useNavigate } from 'react-router-dom';
import { selfcareLogin, getAuthProfilo, manageError, redirect } from '../api/api';
import {useContext, useEffect} from 'react';
import { getDatiModuloCommessa } from '../api/apiSelfcare/moduloCommessaSE/api';
import { PathPf } from '../types/enum';
import { GlobalContext } from '../store/context/globalContext';
import Loader from '../components/reusableComponents/loader';

// Blank page utilizzata per l'accesso degli utenti tramite  Selfcare

/*quando l'utente SELFCARE va al link https://uat.selfcare.pagopa.it/auth/login , procede con login es. (comune di Erba ) , viene fatto un redirect
automatico su questa ('/auth?selfcareToken=token') blank page dove , se c'è un profilo già presente nella LOCAL STORAGE lo andiamo ad eliminare , prendiamo il token che selfcare ci inserisce nell'url ,
e andiamo a fare la prima chiamata getSelfcare che ci restituisce un secondo token che noi utilizziamo nella seconda chiamata getProfilo.
Nella risposta della chiamata getProfilo noi andiamo ad estrapolare il jwt, salvarlo nella LOCAL STORAGE, così da poterlo utilizzare in ogni chiamata 
da parte dell'utente SELFCARE

*/

type  Jwt = {
    jwt:string
}
interface ParameterGetProfilo {
    data:Jwt[]
}
const Auth : React.FC<any> = () =>{
    const globalContextObj = useContext(GlobalContext);
    const {dispatchMainState} = globalContextObj;

    const handleModifyMainState = (valueObj) => {
        globalContextObj.dispatchMainState({
            type:'MODIFY_MAIN_STATE',
            value:valueObj
        });
    };
  
    const [searchParams] = useSearchParams();
    const token = searchParams.get('selfcareToken');
    const navigate = useNavigate();
    
    // terza chiamata fatta per verificare lo stato della commessa e eseguire azioni diverse a seconda del risultato 
    const getCommessa = async (infoProfilo) =>{
        await getDatiModuloCommessa(infoProfilo.jwt, infoProfilo.nonce).then((res)=>{

            if(res.data.modifica === true && res.data.moduliCommessa.length === 0 ){
                handleModifyMainState({
                    inserisciModificaCommessa:'INSERT',
                    statusPageInserimentoCommessa:'mutable',
                    primoInserimetoCommessa:true
                });
            // ci sono commesse inserite nel mese corrente e posso modificarle
            }else if(res.data.modifica === true && res.data.moduliCommessa.length > 0){
                handleModifyMainState({
                    inserisciModificaCommessa:'MODIFY',
                    statusPageInserimentoCommessa:'immutable',
                    primoInserimetoCommessa:false
                });
    
            }else if(res.data.modifica === false ){
                handleModifyMainState({
                    inserisciModificaCommessa:'NO_ACTION',
                    statusPageInserimentoCommessa:'immutable',
                    primoInserimetoCommessa:false
                });
            }
            navigate(PathPf.DATI_FATTURAZIONE_EN);
        }).catch((err)=>{
            manageError(err,dispatchMainState);
        
        });
    };

    //  seconda chiamata
    const getProfilo = async (res:ParameterGetProfilo)=>{
      
        await getAuthProfilo(res.data[0].jwt)
            .then(resp =>{
                const storeProfilo = resp.data;
                const newProfilo = {
                    auth:storeProfilo.auth,
                    nomeEnte:storeProfilo.nomeEnte,
                    descrizioneRuolo:storeProfilo.descrizioneRuolo,
                    ruolo:storeProfilo.ruolo,
                    dataUltimo:storeProfilo.dataUltimo,
                    dataPrimo:storeProfilo.dataPrimo,
                    prodotto:storeProfilo.prodotto,
                    jwt:res.data[0].jwt,
                    profilo:storeProfilo.profilo, // profilo utilizzato per la gestione delle notifiche/contestazioni
                    nonce:storeProfilo.nonce,
                    user:{name:'', ruolo:storeProfilo.descrizioneRuolo, id:'1'},
                    idTipoContratto: storeProfilo.idTipoContratto,
                    idEnte:storeProfilo.idEnte
                };

          
                handleModifyMainState({
                    authenticated:true,
                    profilo:newProfilo,
                    prodotti:[],
                    mese:'',
                    anno:'',
                    nomeEnteClickOn:'',
                    datiFatturazione:false,// l'ente ha i dati di fatturazione?
                    userClickOn:undefined, // se l'utente clicca su un elemento di lista commesse setto GRID
                    inserisciModificaCommessa:undefined, // INSERT MODIFY  se il sevizio get commessa mi restituisce true []
                    primoInserimetoCommessa:true,// la commessa mese corrente è stata inserita?
                    statusPageDatiFatturazione:'immutable',
                    statusPageInserimentoCommessa:'immutable',
                    relSelected:{
                        nomeEnteClickOn:'',
                        mese:0,
                        anno:0,
                        idElement:''
                    },
                    apiError:null,
                    badgeContent:0,
                    messaggioSelected:null
                });
                if(resp.data.profilo === "REC" || resp.data.profilo === "CON"){
                    console.log({HH:resp.data.profilo});
                    navigate(PathPf.LISTA_NOTIFICHE_REC_CON);
                }else{
                    getCommessa(newProfilo);  
                }
            } )
            .catch(() => {
                window.location.href = redirect;
            });
    };
 
    // prima chiamata 
    const getSelfcare = async() =>{
        await selfcareLogin(token).then(res =>{
            localStorage.removeItem("globalState");
            localStorage.removeItem("filters");
            if(res.status === 200){
                getProfilo(res);  
            }
        }).catch(() =>{
            window.location.href = redirect;
        //manageError(err, navigate);
        });
    };

    useEffect(()=>{
   
        getSelfcare();
    },[]);
   
    return (
        <>
            <div className="d-flex justify-content-center align-items-center" style={{height: '100vh'}}>
                <div id='loader_on_gate_pages'>
                    <Loader sentence={'Autenticazione in corso...'}></Loader> 
                </div>
            </div>
        </>
    );
};

export default Auth;
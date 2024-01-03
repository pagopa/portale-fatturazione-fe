import { useSearchParams, useNavigate } from 'react-router-dom';
import { selfcareLogin, getAuthProfilo } from '../api/api';
import {useEffect} from 'react';
import { LoginProps } from '../types/typesGeneral';


const Auth : React.FC<LoginProps> = ({setCheckProfilo, setMainState}) =>{
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    localStorage.removeItem('profilo');
  
    const token = searchParams.get('selfcareToken');


    const getProfilo = async (res:any)=>{
      
        await getAuthProfilo(res.data[0].jwt)
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
                    jwt:res.data[0].jwt
                }));
                
              
              
                setCheckProfilo(true);
               
                // setto il nonce nello state di riferimento globale
                setMainState((prev:any)=>({...prev, ...{nonce:resp?.data.nonce,ruolo:resp.data.ruolo}}));
                navigate("/");
            } )
            .catch(err => {
                navigate('/error');
            });
    };

 
 
    const getSelfcare = async() =>{
        const result = await selfcareLogin(token).then(res =>{
          
            if(res.status === 200){
                // store del token nella local storage per tutte le successive chiamate START
                const storeJwt = {token:res.data[0].jwt};
                localStorage.setItem('token', JSON.stringify(storeJwt));
           
                // store del token nella local storage per tutte le successive chiamate END

                

                getProfilo(res);
               
            }
        }).catch(err =>navigate('/error'));
       
    

    };

    //const objToSave = {token};

    useEffect(()=>{
      
        getSelfcare();
      
        
        // localStorage.setItem('testObject', JSON.stringify(objToSave));
    },[]);
    
   
    return (
        <></>
    );
};

export default Auth;
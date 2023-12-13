import { useSearchParams, useNavigate } from 'react-router-dom';
import { selfcareLogin, getAuthProfilo } from '../api/api';
import {useEffect} from 'react';
import { LoginProps } from '../types/typesGeneral';


const Auth : React.FC<LoginProps> = ({setCheckProfilo, setInfoModuloCommessa}) =>{
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
   
  
    const token = searchParams.get('selfcareToken');


    const getProfilo = async (res:any)=>{
                   
        await getAuthProfilo(res.data[0].jwt)
            .then(resp =>{
                localStorage.removeItem('profilo');
                const storeProfilo = resp.data;
                localStorage.setItem('profilo', JSON.stringify({
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
                setInfoModuloCommessa((prev:any)=>({...prev, ...{nonce:resp?.data.nonce}}));
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
    },[token]);
    
   
    return (
        <input className='auth' value=''></input>
    );
};

export default Auth;
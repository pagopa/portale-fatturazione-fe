import { useSearchParams, useNavigate } from 'react-router-dom';
import { selfcareLogin, getAuthProfilo } from '../api/api';
import {useEffect} from 'react';
import { AuthProps } from '../types/typeAuth';

const Auth : React.FC<AuthProps> = ({setCheckProfilo}) =>{
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
   
  
    const token = searchParams.get('selfcareToken');

    console.log("TOKEN", token);
 
    const getSelfcare = async() =>{
        const result = await selfcareLogin(token).then(res =>{
            console.log({res});
            if(res.status === 200){
                // store del token nella local storage per tutte le successive chiamate START
                const storeJwt = {token:res.data[0].jwt};
                localStorage.setItem('token', JSON.stringify(storeJwt));
                // store del token nella local storage per tutte le successive chiamate END

                const getProfilo = async ()=>{
                   
                    await getAuthProfilo(res.data[0].jwt)
                        .then(res =>{
                           
                            const storeProfilo = res.data;
                            localStorage.setItem('profilo', JSON.stringify(storeProfilo));
                            setCheckProfilo(true);
                            navigate("/");
                        } )
                        .catch(err => {
                            navigate('/login');
                        });
                };

                getProfilo();
               
            }
        }).catch(err => console.log(err.message));
       
        console.log(result, 'selfcare');

    };

    //const objToSave = {token};

    // console.log(token,'ciao');
    useEffect(()=>{
        getSelfcare();
        // localStorage.setItem('testObject', JSON.stringify(objToSave));
    },[token]);
    
   
    return (
        <div></div>
    );
};

export default Auth;
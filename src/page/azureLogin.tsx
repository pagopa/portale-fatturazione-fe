import { useState, useEffect } from "react";
import { useMsal } from "@azure/msal-react";
import { InteractionRequiredAuthError } from "@azure/msal-browser";

const AzureLogin : React.FC = () =>{


    useEffect(()=>{
        localStorage.removeItem('profilo');
        localStorage.removeItem('token');
        localStorage.removeItem('statusApplication');

       
    },[]);

   
   
   
   

    

   


    return (
      
        <div className='container d-flex align-items-center justify-content-center ' style={{height: '400px'}}>
            <h1>Azure Login</h1>
        
        </div>
            
     
    );
};

export default AzureLogin;
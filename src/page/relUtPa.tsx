import React, { useState } from "react";
import SelectUltimiDueAnni from "../components/reusableComponents/selectUltimiDueAnni";
import SelectMese from "../components/reusableComponents/selectMese";
import { Button, Typography } from "@mui/material";
import SelectTipologiaFattura from "../components/rel/selectTipologiaFattura";
import TextRagioneSociale from "../components/rel/textFieldRegSociale";
import DataTable from "../components/rel/grid";

const RelPage : React.FC = () =>{

    const currentYear = (new Date()).getFullYear();

    const [bodyRel, setBodyRel] = useState({anno:currentYear});
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
                    <div  className="col-3">
                        <TextRagioneSociale values ={bodyRel} setValue={setBodyRel}></TextRagioneSociale>
                    </div>
                   
                    
                </div>
                
                <div className="row mt-4">
                    
                    <div className="col-1">
                        <Button  variant="contained">Filtra</Button>
                    </div>
                    <div className="col-2">
                        <Button >Annulla Filtri</Button>
                    </div>
                </div>


                <div className="mt-4">
                    <DataTable></DataTable>
                </div>
            
               
            </div>
            
               


        </div>


    );
};

export default RelPage;
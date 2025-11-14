import { Box, Grid } from "@mui/material";
import MainBoxStyled, { ResponsiveGridContainer } from "../../components/reusableComponents/layout/mainComponent";
import MainFilter from "../../components/reusableComponents/mainFilter";
import { useState } from "react";
import { ElementMultiSelect, OptionMultiselectChackbox } from "../../types/typeReportDettaglio";

const TestListaModuli  = () => {

    const [gridData, setGridData] = useState([]);
    const [body, setBody] = useState({ init:new Date(),end:null,initContratto:new Date(),endContratto:null});
    const [infoPage , setInfoPage] = useState({ page: 0, pageSize: 10 });
    const [errorDataInizioFine,setErrorDataInizioFine] = useState(false);
    const [errorContrattoInizioFine,setErrorContrattoInizioFine] = useState(false);
    const [dataSelect, setDataSelect] = useState<ElementMultiSelect[]>([]);
    const [textValue, setTextValue] = useState('');
    const [valueAutocomplete, setValueAutocomplete] = useState<OptionMultiselectChackbox[]>([]);
   
                

    const clearOnChangeFilter = () => {
        setGridData([]);
        setInfoPage({ page: 0, pageSize: 10 });  
    };

    return (
        <MainBoxStyled title={"Modulo commessa previsonale"}>
            <Box
                sx={{
                    mt: "3rem",
                    mb: "3rem"
                }}
            >
                <ResponsiveGridContainer >
                    <MainFilter 
                        filterName={"date_from_to"}
                        inputLabel={"Data inizio"}
                        clearOnChangeFilter={clearOnChangeFilter}
                        setBody={setBody}
                        body={body}
                        keyInput={"init"}
                        keyCompare={"end"}
                        error={errorDataInizioFine}
                        setError={setErrorDataInizioFine}
                    ></MainFilter>
                    <MainFilter 
                        filterName={"date_from_to"}
                        inputLabel={"Data fine"}
                        clearOnChangeFilter={clearOnChangeFilter}
                        setBody={setBody}
                        body={body}
                        keyInput={"end"}
                        keyCompare={"init"}
                        error={errorDataInizioFine}
                        setError={setErrorDataInizioFine}
                    ></MainFilter>
                    <MainFilter 
                        filterName={"select_key_value"}
                        inputLabel={"Tipologia contratto"}
                        clearOnChangeFilter={clearOnChangeFilter}
                        setBody={setBody}
                        body={body}
                        keyInput={"tipocontratto"}
                        keyCompare={""}
                    ></MainFilter>
                    <MainFilter 
                        filterName={"rag_sociale"}
                        clearOnChangeFilter={clearOnChangeFilter}
                        setBody={setBody}
                        body={body}
                        keyInput={"idEnti"}
                        keyCompare={""}
                        dataSelect={dataSelect}
                        setTextValue={setTextValue}
                        valueAutocomplete={valueAutocomplete}
                        setValueAutocomplete={setValueAutocomplete}
                    ></MainFilter>
                </ResponsiveGridContainer>
                <ResponsiveGridContainer  sx={{ mt: "0.5rem !important" }}>
                    <MainFilter 
                        filterName={"date_from_to"}
                        inputLabel={"Data inizio adesione"}
                        clearOnChangeFilter={clearOnChangeFilter}
                        setBody={setBody}
                        body={body}
                        keyInput={"initContratto"}
                        keyCompare={"endContratto"}
                        error={errorContrattoInizioFine}
                        setError={setErrorContrattoInizioFine}
                    ></MainFilter>
                    <MainFilter 
                        filterName={"date_from_to"}
                        inputLabel={"Data fine adesione"}
                        clearOnChangeFilter={clearOnChangeFilter}
                        setBody={setBody}
                        body={body}
                        keyInput={"endContratto"}
                        keyCompare={"initContratto"}
                        error={errorContrattoInizioFine}
                        setError={setErrorContrattoInizioFine}
                    ></MainFilter>
                </ResponsiveGridContainer>
            </Box>
        </MainBoxStyled>
    );
};
export default TestListaModuli;
//<MainFilter></MainFilter>
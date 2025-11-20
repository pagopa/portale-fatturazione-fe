import {MainBoxStyled, ResponsiveGridContainer,FilterActionButtons, ActionTopGrid } from "../../components/reusableComponents/layout/mainComponent";
import { SetStateAction, useState } from "react";
import { ElementMultiSelect, OptionMultiselectChackbox } from "../../types/typeReportDettaglio";
import MainFilter from "../../components/reusableComponents/mainFilter";

const TestListaModuli  = () => {

    const [gridData, setGridData] = useState([]);
    const [body, setBody] = useState({ init:new Date(),end:null,initContratto:new Date(),endContratto:null});
    const [infoPage , setInfoPage] = useState({ page: 0, pageSize: 10 });
    const [errorDataInizioFine,setErrorDataInizioFine] = useState(false);
    const [errorContrattoInizioFine,setErrorContrattoInizioFine] = useState(false);
    const [dataSelect, setDataSelect] = useState<ElementMultiSelect[]>([]);
    const [valueSelected, setValueSelected] = useState('');
    const [valueAutocomplete, setValueAutocomplete] = useState<OptionMultiselectChackbox[]>([]);
    const [statusAnnulla, setStatusAnnulla] = useState('hidden');
   
                

    const clearOnChangeFilter = () => {
        setGridData([]);
        setInfoPage({ page: 0, pageSize: 10 });  
    };

    const onButtonFiltra = () => {
        console.log(1);
    };
    
    const onButtonAnnulla = () =>{
        console.log(2);
    };

    return (
        <MainBoxStyled title={"Modulo commessa previsonale"} actionButton={[{
            onButtonClick: () => console.log("ciao"),
            variant: "contained",
            icon:{name:"download", sx:{} },
            withText:false
        }]}>
            <ResponsiveGridContainer >
                <MainFilter 
                    filterName={"date_from_to"}
                    inputLabel={"Data inizio"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBody}
                    body={body}
                    keyValue={"init"}
                    keyDescription=""
                    keyCompare={"end"}
                    error={errorDataInizioFine}
                ></MainFilter>
                <MainFilter 
                    filterName={"date_from_to"}
                    inputLabel={"Data fine"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBody}
                    body={body}
                    keyValue={"end"}
                    keyDescription=""
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
                    keyValue={"tipocontratto"}
                    keyDescription=""
                    keyCompare={""}
                ></MainFilter>
                <MainFilter 
                    filterName={"multi_checkbox"}
                    inputLabel={"Rag. Soc. Ente"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBody}
                    body={body}
                    keyValue={"idEnti"}
                    keyDescription=""
                    dataSelect={dataSelect}
                    valueAutocomplete={valueAutocomplete}
                    setValueAutocomplete={setValueAutocomplete}
                ></MainFilter>
                <MainFilter 
                    filterName={"date_from_to"}
                    inputLabel={"Data inizio adesione"}
                    clearOnChangeFilter={clearOnChangeFilter}
                    setBody={setBody}
                    body={body}
                    keyValue={"initContratto"}
                    keyDescription=""
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
                    keyValue={"endContratto"}
                    keyDescription=""
                    keyCompare={"initContratto"}
                    error={errorContrattoInizioFine}
                    setError={setErrorContrattoInizioFine}
                ></MainFilter>
            </ResponsiveGridContainer>
            <FilterActionButtons 
                onButtonFiltra={onButtonFiltra} 
                onButtonAnnulla={onButtonAnnulla} 
                statusAnnulla={statusAnnulla} 
                actionButton={[{
                    onButtonClick: () => console.log("ciao"),
                    variant: "contained",
                    label: "Download test",
                    icon:{name:"download"}
                }]}></FilterActionButtons>
            <ActionTopGrid
                actionButtonRight={[{
                    onButtonClick: () => console.log("ciao"),
                    variant: "outlined",
                    label: "Download test",
                    icon:{name:"download"},
                    disabled:true
                }]}
                actionButtonLeft={[{
                    onButtonClick: () => console.log("ciao"),
                    variant: "outlined",
                    label: "Download test",
                    icon:{name:"download"}
                }]}
            />
        </MainBoxStyled>
    );
};
export default TestListaModuli;
//<MainFilter></MainFilter>
import { Button } from "@mui/material";
import MainFilter from "../reusableComponents/mainFilter";

interface FiltersCollapseInvioFattureProps {
  element: Record<string, any>;
  selectedRows: Record<string, any>[];
  manageStateCheckbox?: (currentRow:Record<string, any>,val:string,array:Record<string, any>[]) => {verifyIfSelected:boolean,disabled:boolean};
  onGenerate: () => void;
}

const FiltersCollapseInvioFatture = ({
  element,
  selectedRows,
  manageStateCheckbox,
  onGenerate
}: FiltersCollapseInvioFattureProps) => {
  return (
    <>
      <MainFilter
        sizeHeight={"small"}
        filterName={"multi_checkbox"}
        inputLabel={"Rag. Soc. Ente"}
        clearOnChangeFilter={()=> null}
        setBody={() => null}
        body={{}}
        keyCompare={""}
        dataSelect={[]}
        setTextValue={() => null}
        textValue={""}
        valueAutocomplete={[]}
        setValueAutocomplete={() => null}
        keyDescription={"descrizione"}
        keyValue={"idEnte"}
        keyOption='descrizione'
        keyBody={"idEnti"} />
      <MainFilter
        sizeHeight={"small"}
        filterName={"input_text"}
        inputLabel={"Numero Fattura"}
        clearOnChangeFilter={() => null}
        setBody={() => null}
        body={{}}
        keyDescription='iun'
        keyBody={"iun"}
        keyValue={"iun"}/>
      <MainFilter
        sizeHeight={"small"}
        filterName={"date_from_to"}
        inputLabel={"Data Fattura"}
        clearOnChangeFilter={() => null}
        setBody={() => null}
        body={{}}
        keyValue={"init"}
        keyDescription="start"
        keyBody="init"
        keyCompare="il nulla"
        error={false}
      />
      <Button disabled={manageStateCheckbox && manageStateCheckbox(element,"",selectedRows)?.disabled || selectedRows.length === 0} onClick={onGenerate} size={"small"} variant="outlined">Generazione Json</Button>
    </>
  );
};

export default FiltersCollapseInvioFatture;

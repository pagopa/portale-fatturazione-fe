import { Button } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import MainFilter from "../reusableComponents/mainFilter";

export interface FiltriCollapseInvioFatture {
  ragioneSociale: string | null;
  idFattura: string | null;
  dataFattura: Date | string | null;
}

interface FiltersCollapseInvioFattureProps {
  element: Record<string, any>;
  selectedRows: Record<string, any>[];
  manageStateCheckbox?: (currentRow:Record<string, any>,val:string,array:Record<string, any>[]) => {verifyIfSelected:boolean,disabled:boolean};
  onGenerate: () => void;
  onFilter?: (filtri: FiltriCollapseInvioFatture) => void;
  onLoading?: (loading: boolean) => void;
}

const DEBOUNCE_MS = 2000;
const MIN_CHARS = 3;

const FiltersCollapseInvioFatture = ({
  element,
  selectedRows,
  manageStateCheckbox,
  onGenerate,
  onFilter,
  onLoading
}: FiltersCollapseInvioFattureProps) => {

  const [filtri, setFiltri] = useState<FiltriCollapseInvioFatture>({
    ragioneSociale: null,
    idFattura: null,
    dataFattura: null,
  });

  const isFirstRender = useRef(true);

  useEffect(() => {
    // al mount non filtro: vengono mostrati tutti gli elementi della response
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    // testo con 1-2 caratteri: non avvio il filtro (minimo 3 caratteri)
    const tooShort = (v: string | null) => !!v && v.trim().length > 0 && v.trim().length < MIN_CHARS;
    if (tooShort(filtri.ragioneSociale) || tooShort(filtri.idFattura)) {
      onLoading && onLoading(false);
      return;
    }

    // loading visibile dall'inizio della ricerca (debounce) fino all'applicazione dei filtri
    onLoading && onLoading(true);
    const timer = setTimeout(() => {
      // filtri vuoti => la funzione ripristina tutti gli elementi della response iniziale
      onFilter && onFilter(filtri);
      onLoading && onLoading(false);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [filtri.ragioneSociale, filtri.idFattura, filtri.dataFattura]);

  // se il collapse viene chiuso durante il debounce, spengo il loading
  useEffect(() => () => { onLoading && onLoading(false); }, []);

  return (
    <>
      <MainFilter
        sizeHeight={"small"}
        filterName={"input_text"}
        inputLabel={"Ragione Sociale"}
        clearOnChangeFilter={() => null}
        setBody={setFiltri}
        body={filtri}
        keyDescription='ragioneSociale'
        keyBody={"ragioneSociale"}
        keyValue={"ragioneSociale"}/>
      <MainFilter
        sizeHeight={"small"}
        filterName={"input_text"}
        inputLabel={"Numero Fattura"}
        clearOnChangeFilter={() => null}
        setBody={setFiltri}
        body={filtri}
        keyDescription='idFattura'
        keyBody={"idFattura"}
        keyValue={"idFattura"}/>
      <MainFilter
        sizeHeight={"small"}
        filterName={"date_from_to"}
        inputLabel={"Data Fattura"}
        clearOnChangeFilter={() => null}
        setBody={setFiltri}
        body={filtri}
        keyValue={"dataFattura"}
        keyDescription="start"
        keyBody="dataFattura"
        keyCompare="dataFatturaEnd"
        error={false}
      />
      <Button disabled={manageStateCheckbox && manageStateCheckbox(element,"",selectedRows)?.disabled || selectedRows.length === 0} onClick={onGenerate} size={"small"} variant="outlined">Generazione Json</Button>
    </>
  );
};

export default FiltersCollapseInvioFatture;

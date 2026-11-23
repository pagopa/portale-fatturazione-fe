import { Button, CircularProgress, Grid } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import MainFilter from "../reusableComponents/mainFilter";

export interface FiltriCollapseInvioFatture {
  ragioneSociale: string | null;
  idFattura: string | null;
  dataFattura: Date | string | null;
  numeroInvii:null|number;
}

interface FiltersCollapseInvioFattureProps {
  element: Record<string, any>;
  selectedRows: Record<string, any>[];
  manageStateCheckbox?: (currentRow:Record<string, any>,val:string,array:Record<string, any>[]) => {verifyIfSelected:boolean,disabled:boolean};
  onGenerate: () => void;
  onFilter?: (filtri: FiltriCollapseInvioFatture) => void;
  onLoading?: (loading: boolean) => void;
  // filtri disabilitati finché sono in corso le chiamate del dettaglio
  disabled?: boolean;
  // loading al posto della scritta "Generazione Json" finché la modale non è visualizzata
  generateLoading?: boolean;
}

// ogni filtro occupa col-2 da md in su, altrimenti tutta la larghezza disponibile
const FILTER_ITEM_PROPS = { xs: 12, md: 2 };

const DEBOUNCE_MS = 2000;
const MIN_CHARS = 3;

const FiltersCollapseInvioFatture = ({
  element,
  selectedRows,
  manageStateCheckbox,
  onGenerate,
  onFilter,
  onLoading,
  disabled = false,
  generateLoading = false
}: FiltersCollapseInvioFattureProps) => {

  const [filtri, setFiltri] = useState<FiltriCollapseInvioFatture>({
    ragioneSociale: null,
    idFattura: null,
    dataFattura: null,
    numeroInvii:null
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
  }, [filtri.ragioneSociale, filtri.idFattura, filtri.dataFattura, filtri.numeroInvii]);

  // se il collapse viene chiuso durante il debounce, spengo il loading
  useEffect(() => () => { onLoading && onLoading(false); }, []);

  return (
    <Grid container spacing={2} alignItems="center" sx={{ flex: 1 }}>
      <MainFilter
        itemProps={FILTER_ITEM_PROPS}
        sizeHeight={"small"}
        filterName={"input_text"}
        inputLabel={"Ragione Sociale"}
        clearOnChangeFilter={() => null}
        setBody={setFiltri}
        body={filtri}
        keyDescription='ragioneSociale'
        keyBody={"ragioneSociale"}
        keyValue={"ragioneSociale"}
        disabled={disabled}/>
      <MainFilter
        itemProps={FILTER_ITEM_PROPS}
        sizeHeight={"small"}
        filterName={"input_text"}
        inputLabel={"Numero Fattura"}
        clearOnChangeFilter={() => null}
        setBody={setFiltri}
        body={filtri}
        keyDescription='idFattura'
        keyBody={"idFattura"}
        keyValue={"idFattura"}
        disabled={disabled}/>
      <MainFilter
        itemProps={FILTER_ITEM_PROPS}
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
        disabled={disabled}
      />
      <MainFilter
        itemProps={FILTER_ITEM_PROPS}
        sizeHeight={"small"}
        filterName={"select_key_value"}
        inputLabel="Tipologia Invio"
        clearOnChangeFilter={() => null}
        // 0 = Tutte (nessun filtro), selezionato di default quando numeroInvii è null
        arrayValues={[{descrizione:"Tutte",numeroInvii:0}, {descrizione:"Inviate",numeroInvii:1}, {descrizione:"Re-inviate",numeroInvii:2}]}
        defaultValue={0}
        keyValue="numeroInvii"
        keyDescription="descrizione"
        keyBody="numeroInvii"
        body={filtri}
        setBody={setFiltri}
        disabled={disabled}
        hidden={element.statoInvio ===  "DA_INVIARE"}
      />
      <Grid item {...FILTER_ITEM_PROPS}>
        <Button
          disabled={generateLoading || disabled || manageStateCheckbox && manageStateCheckbox(element,"",selectedRows)?.disabled || selectedRows.length === 0}
          onClick={onGenerate}
          size={"small"}
          variant="outlined"
          // larghezza fissa: il bottone non cambia dimensione quando la scritta viene sostituita dal loading
          sx={{ minWidth: 150 }}
        >
          {generateLoading ? <CircularProgress size={18} /> : "Generazione Json"}
        </Button>
      </Grid>
    </Grid>
  );
};

export default FiltersCollapseInvioFatture;

import { useRef, useState } from "react";
import { ActionTopGrid, FilterActionButtons, MainBoxStyled, RenderIcon, ResponsiveGridContainer } from "../../components/reusableComponents/layout/mainComponent";
import MainFilter from "../../components/reusableComponents/mainFilter";
import { styled } from "@mui/material";
import GridUploadContestazioni from "../../components/contestazioni/gridUploadContestazioni";
import { manageError, managePresaInCarico } from "../../api/api";
import { downloadNotifche, getMessaggiCountEnte } from "../../api/apiSelfcare/notificheSE/api";
import { tipoNotifica } from "../../reusableFunction/reusableArrayObj";
import ModalLoading from "../../components/reusableComponents/modals/modalLoading";
import { useGlobalStore } from "../../store/context/useGlobalStore";
import { OptionMultiselectChackboxTipoNot } from "../../types/typeReportDettaglio";
import ModalUpload from "../../components/reusableComponents/modals/modalUploadContestazioni";
import { BodyContestazionePage } from "../prod_pn/inserimentoContestazioni";
import { uploadContestazioniAzure } from "../../api/apiPagoPa/notifichePA/api";
import useSavedFiltersNested from "../../hooks/usaSaveFiltersLocalStorageNested";
import { PathPf } from "../../types/enum";


const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});
interface RecapObjContestazioni{
  tipologiaFattura: string
  idFlagContestazione: number
  totaleNotificheAnalogiche: number
  icon:string
}

const RispostaContestazioniEnte : React.FC = () => {
  const mainState = useGlobalStore(state => state.mainState);
  const dispatchMainState = useGlobalStore(state => state.dispatchMainState);
  const setCountMessages = useGlobalStore(state => state.setCountMessages);
  const setStatusQueryGetUri = useGlobalStore(state => state.setStatusQueryGetUri);
  const setErrorAlert = useGlobalStore(state => state.setErrorAlert);
   
    
  const token =  mainState.profilo.jwt;
  const profilo =  mainState.profilo;
  //:TODO da cambiare
  const [bodyGetLista, setBodyGetLista] = useState({
    profilo:"",
    prodotto:"",
    anno:"2026",
    mese:1, 
    tipoNotifica:null,
    statoContestazione:[],
    cap:null,
    iun:null,
    recipientId:null
  });
  const [showLoading, setShowLoading] = useState(false);
  const [arrayYears, setArrayYears] = useState(["2026"]);
  const [arrayMonths, setArrayMonths] = useState([1]);
  const [valueAutocompleteTipoNot,setValueAutocompleteTipoNot] = useState<OptionMultiselectChackboxTipoNot[]>([]);
  const uploadRef = useRef<boolean>(false);
  const [file, setFile] = useState<File|null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [openModalConferma, setOpenModalConferma] = useState(false);
  const [showModalUpload,setShowModalUpload] = useState(false);
  const [valueSelected, setValueSelected] = useState(null);

  const [body,setBody] = useState<BodyContestazionePage>({
    anno:'',
    mese:'',
    idEnte: "",
    contractId: ""
  });
  
  const { 
    filters,
    updateFilters,
    isInitialRender,
    resetFilters
  } = useSavedFiltersNested(PathPf.RISPOSTA_CONTEST_ENTE,{});



  const clearOnChangeFilter =  () => {
    console.log("mimmo");
  };


  const mock = [
    {
      "tipologiaFattura": "Notifica assente",
      "idFlagContestazione": 10,
      "totaleNotificheAnalogiche": 10,
      "icon":""
    },
    {
      "tipologiaFattura": "Notifica già fatturata",
      "idFlagContestazione": 8,
      "totaleNotificheAnalogiche": 7,
      "icon":""
    }
  ];

  const downloadNotificheOnDownloadButton = async () =>{
    setShowLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars  
    await downloadNotifche(token, profilo.nonce,{
      profilo:"",
      prodotto:"",
      anno:2025,
      mese:12, 
      tipoNotifica:null,
      statoContestazione:[],
      cap:null,
      iun:null,
      recipientId:null
    } ).then(async(res)=>{
      setShowLoading(false); 
      //:TODO da decommentare
      //setStatusQueryGetUri((prev)=>([...prev,...[res?.data?.statusQueryGetUri]]));
      managePresaInCarico('PRESA_IN_CARICO_DOCUMENTO_ENTE',dispatchMainState);
      await getMessaggiCountEnte(token,profilo.nonce).then((res)=>{
        const numMessaggi = res.data;
        setCountMessages(numMessaggi);
      }).catch((err)=>{
        return;
      });
    }).catch(((err)=>{
      setShowLoading(false);
      if(err?.response?.request?.status === 300){
        managePresaInCarico("DOWNLOAD_NOTIFICHE_DOUBLE_REQUEST",dispatchMainState);
      }else if(err?.response?.request?.status === 404){
        managePresaInCarico(400,dispatchMainState);
      }else if(err?.response?.request?.status === 400){
        managePresaInCarico('NO_OPERAZIONE',dispatchMainState);
      }else{
        manageError(err,dispatchMainState);
      }
    }));   
  };
  const uploadFile = async () => {
    uploadRef.current = true;
    const fileId = crypto.randomUUID();
    if (!file) return;
    const chunkSize:number = 5 * 1024 * 1024; // 4 MB
    const totalChunks = Math.ceil(file.size / chunkSize);
    let start = 0;
    setUploading(true);
    try{
      while (start < file.size) {
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);
        const formData = new FormData();
        formData.append('fileChunk', chunk, file.name);
        formData.append('fileId', fileId); // Include the unique file ID
        formData.append('chunkIndex', Math.floor(start / chunkSize).toString());
        formData.append('totalChunks', totalChunks.toString());
        formData.append('idEnte', body.idEnte);
        formData.append('contractId', body.contractId);
        formData.append('mese', body.mese);
        formData.append('anno', body.anno);
        // Create a promise for each chunk upload
        /// forse da eliminare, ho inserito questo per i file con le dimensioni di un solo chunk
        if(totalChunks === 1 ){
          setProgress(50);
        }
        await uploadContestazioniAzure(token,profilo.nonce,formData).then((res)=>{
          setProgress((prevProgress) => (prevProgress >= 101 ? 0 : prevProgress + (100/totalChunks)));
          if(res.data.item2 === true){
            managePresaInCarico('PRESA_IN_CARICO_DOCUMENTO',dispatchMainState);
          }
        }).catch((err)=>{
          setErrorAlert({error:409,message:err?.response?.data?.detail|| "L'operazione non è andata a buon fine"});
          throw new Error(err.response.data.details); 
        });
        start = end;
      }
    }catch(err){
      setUploading(false);
      setProgress(0);
      setOpenModalConferma(false);
      setFile(null);   
    }
    /// prova a fermare la get dettaglio andando a gestire la logica con luploading
    setProgress(0);
    setOpenModalConferma(false);
    setFile(null);
    resetFilters();
    setUploading(false);
  };

  const currentLocation = location.pathname;
  console.log({currentLocation});

  let Mese = "Dicembre";
  let Anno = 2025;

  if(currentLocation === "/rispsend"){
    Mese = "Gennaio";
    Anno = 2026;
    
  }else if(currentLocation === "/chiu"){
    Mese = "Febbraio";
    Anno = 2026;
  }


  const [mockGridUpload,setMockGridUpload] = useState([
    {   id:1,
      motivoContestazione:"Notifica assente",
      anno:Anno,
      mese:Mese,
      file:false,
      fileValue:null
    },
    {   id:2,
      motivoContestazione:"Notifica già fatturata",
      anno:Anno,
      mese:Mese,
      file:false,
      fileValue:null
    },
    {   id:3,
      motivoContestazione:"Notifica con importo incoerente",
      anno:Anno,
      mese:Mese,
      file:false,
      fileValue:null
    },
    {   id:4,
      motivoContestazione:"Notifica con stato incoerente",
      anno:Anno,
      mese:Mese,
      file:false,
      fileValue:null
    },
    {   id:5,
      motivoContestazione:"Doppio invio allo stesso indirizzo",
      anno:Anno,
      mese:Mese,
      file:false,
      fileValue:null
    }
  ]);

  const onUpload = (event,value) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const restOfObjects = mockGridUpload.filter(obj => obj.id !== value.id );
    console.log({event,value, restOfObjects});
    const mergeElement = [...restOfObjects,{...value,fileValue:file,file:true}];
    const newMockOrdered = mergeElement.sort((a, b) => a.id - b.id);
    setMockGridUpload(newMockOrdered);
  };

  return (
    <>
      <MainBoxStyled title={"Risposta a SEND"}>
        <ResponsiveGridContainer >
          <MainFilter 
            filterName={"select_value_string"}
            inputLabel={"Anno"}
            clearOnChangeFilter={clearOnChangeFilter}
            setBody={setBodyGetLista}
            body={bodyGetLista}
            keyDescription={"anno"}
            keyValue={"anno"}
            keyBody={"anno"}
            arrayValues={arrayYears}
            disabled={true}
          ></MainFilter>
          <MainFilter 
            filterName={"select_value_string"}
            inputLabel={"Mese"}
            clearOnChangeFilter={clearOnChangeFilter}
            setBody={setBodyGetLista}
            body={bodyGetLista}
            keyDescription={"mese"}
            keyValue={"mese"}
            keyBody={"mese"}
            arrayValues={arrayMonths}
            disabled={true}
          ></MainFilter>
          <MainFilter 
            filterName={"multi_checkbox"}
            inputLabel={"Tipo notifica"}
            clearOnChangeFilter={clearOnChangeFilter}
            setBody={setBodyGetLista}
            body={bodyGetLista}
            valueAutocomplete={valueAutocompleteTipoNot}
            setValueAutocomplete={setValueAutocompleteTipoNot}
            keyDescription={"name"}
            keyValue={"id"}
            keyOption='name'
            iconMaterial={RenderIcon("type-not",true)}
            keyCompare={""}
            dataSelect={tipoNotifica}
            arrayValues={tipoNotifica}
            keyBody={"tipoNotifica"}
          ></MainFilter>

        </ResponsiveGridContainer>
        <FilterActionButtons 
          onButtonFiltra={()=> console.log("filtera")} 
          onButtonAnnulla={()=> console.log("annulla")} 
          statusAnnulla={"hidden"} 
        ></FilterActionButtons>
        <ActionTopGrid
          actionButtonRight={[ {
            onButtonClick:() => downloadNotificheOnDownloadButton(),
            variant: "outlined",
            label: "Download file contestazioni",
            icon:{name:"download"},
            disabled:false
          },
          ]}/>
        <GridUploadContestazioni popUp={true}></GridUploadContestazioni>
      </MainBoxStyled>
      <ModalLoading 
        open={showLoading} 
        setOpen={setShowLoading}
        sentence={"Elaborazione in corso"} >
      </ModalLoading>
      <ModalUpload  open={showModalUpload} setOpen={setShowModalUpload} uploadFun={onUpload} valueSelected={valueSelected}/>
    </>
  );
};

export default RispostaContestazioniEnte;
import { useState } from "react";
import { ActionTopGrid, FilterActionButtons, MainBoxStyled, RenderIcon, ResponsiveGridContainer } from "../../components/reusableComponents/layout/mainComponent";
import MainFilter from "../../components/reusableComponents/mainFilter";
import { Box } from "@mui/material";
import NavigatorHeader from "../../components/reusableComponents/navigatorHeader";
import GavelIcon from '@mui/icons-material/Gavel';
import { PathPf } from "../../types/enum";
import GridUploadContestazioni from "../../components/contestazioni/gridUploadContestazioni";
import ModalLoading from "../../components/reusableComponents/modals/modalLoading";
import { downloadNotifche, getMessaggiCountEnte } from "../../api/apiSelfcare/notificheSE/api";
import { manageError, managePresaInCarico } from "../../api/api";
import { tipoNotifica, tipoNotificaArray } from "../../reusableFunction/reusableArrayObj";
import { useGlobalStore } from "../../store/context/useGlobalStore";
import { OptionMultiselectChackboxTipoNot } from "../../types/typeReportDettaglio";
import { headersNameGridView } from "../../assets/configurations/conf_GridViewStoricoContestazioniEnte";
import GridView from "../../components/reusableComponents/grid/gridView/gridView";

interface RecapObjContestazioni{
  //tipologiaFattura: string
  idFlagContestazione: number
  flagContestazione: string
  totale: number
  totaleNotificheAnalogiche: number
  totaleNotificheDigitali: number  
}


const InizioContestazione : React.FC = () => {

  const mainState = useGlobalStore(state => state.mainState);
  const dispatchMainState = useGlobalStore(state => state.dispatchMainState);
  const setCountMessages = useGlobalStore(state => state.setCountMessages);
  const setStatusQueryGetUri = useGlobalStore(state => state.setStatusQueryGetUri);

  const token =  mainState.profilo.jwt;
  const profilo =  mainState.profilo;
  //:TODO da cambiare
  const [bodyGetLista, setBodyGetLista] = useState<any>({
    profilo:"",
    prodotto:"",
    anno:"2025",
    mese:12, 
    tipoNotifica:null,
    statoContestazione:[],
    cap:null,
    iun:null,
    recipientId:null
  });
  const [arrayYears, setArrayYears] = useState(["2025"]);
  const [arrayMonths, setArrayMonths] = useState([12]);
  const [showModalUpload,setShowModalUpload] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [valueAutocompleteTipoNot,setValueAutocompleteTipoNot] = useState<OptionMultiselectChackboxTipoNot[]>([]);

  const clearOnChangeFilter =  () => {
    console.log("mimmo");
  };


  const mock = [{
    "flagContestazione": "Non Contestata",
    "totaleNotificheDigitali":1,
    "totaleNotificheDigitaliInt":2,
    "totaleNotificheAR":3,
    "totaleNotificheARInt":4,
    "totaleNotifiche890":5,
    "totale": 15,
    "idFlagContestazione": 1,
  },
  {
    "flagContestazione": "Non Contestata",
    "totaleNotificheDigitali":2,
    "totaleNotificheDigitaliInt":4,
    "totaleNotificheAR":6,
    "totaleNotificheARInt":8,
    "totaleNotifiche890":10,
    "totale": 30,
    "idFlagContestazione": 1,
  }];

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


   


  return (
    <>
      <div>
        <NavigatorHeader pageFrom={"Contestazioni/"} pageIn={"Crea contestazione"} backPath={PathPf.STORICO_CONTEST_ENTE} icon={<GavelIcon  sx={{paddingBottom:"5px"}}  fontSize='small'></GavelIcon>}></NavigatorHeader>
      </div>
      <MainBoxStyled title="">
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
          actionButtonRight={[{
            onButtonClick:() => downloadNotificheOnDownloadButton(),
            variant: "outlined",
            label: "Download file notifiche",
            icon:{name:"download"},
            disabled:false
          }
          ]}/>
      
        <GridView
          arrayData={mock}
          configHeader={headersNameGridView} 
          noDataMessage={"Non ci sono notifiche da visualizzare"}
          noDataTitle={"Nessun dato disponibile"}
          apiRunning={false}
        /> 
       
        <GridUploadContestazioni popUp={false}></GridUploadContestazioni>
               
               
      </MainBoxStyled>
      <ModalLoading 
        open={showLoading} 
        setOpen={setShowLoading}
        sentence={"Elaborazione in corso"} >
      </ModalLoading>
    </>
  );
};

export default InizioContestazione;

/*
 return (
                                    <TableCell sx={{
                                        borderTop: "5px solid",
                                        borderBottom: "5px solid",
                                        borderColor: "#FFFFFF",
                                        padding: "10px",
                                    }} key={Math.random()} align={"center"}>{value}</TableCell>
                                ); */
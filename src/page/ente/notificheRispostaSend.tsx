import { useState } from "react";
import { ActionTopGrid, FilterActionButtons, MainBoxStyled, ResponsiveGridContainer } from "../../components/reusableComponents/layout/mainComponent";
import MainFilter from "../../components/reusableComponents/mainFilter";
import { Box, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import GridUploadContestazioni from "../../components/contestazioni/gridUploadContestazioni";
import { manageError, managePresaInCarico } from "../../api/api";
import { downloadNotifche, getMessaggiCountEnte } from "../../api/apiSelfcare/notificheSE/api";
import { tipoNotificaArray } from "../../reusableFunction/reusableArrayObj";
import ModalLoading from "../../components/reusableComponents/modals/modalLoading";
import ModalUpload from "../../components/reusableComponents/modals/modalUploadContestazioni";
import { useGlobalStore } from "../../store/context/useGlobalStore";

interface RecapObjContestazioni{
    tipologiaFattura: string
    idFlagContestazione: number
    flagContestazione: string
    totale: number
    totaleNotificheAnalogiche: number
    totaleNotificheDigitali: number  
}

const NotificheRispostaSend = () => {
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
  

    const clearOnChangeFilter =  () => {
        console.log("mimmo");
    };


    const mock = [
        {
            "tipologiaFattura": "CONTESTAZIONE",
            "idFlagContestazione": 1,
            "flagContestazione": "Contestata ENTE",
            "totale": 377032,
            "totaleNotificheAnalogiche": 136108,
            "totaleNotificheDigitali": 240924
        },
        {
            "tipologiaFattura": "CONTESTAZIONE",
            "idFlagContestazione": 8,
            "flagContestazione": "Contestata ENTE",
            "totale": 1,
            "totaleNotificheAnalogiche": 0,
            "totaleNotificheDigitali": 1
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
                        disabeledSelect={true}
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
                        disabeledSelect={true}
                    ></MainFilter>
                    <MainFilter 
                        filterName={"select_value_string"}
                        inputLabel={"Tipo Notifica"}
                        clearOnChangeFilter={clearOnChangeFilter}
                        setBody={setBodyGetLista}
                        body={bodyGetLista}
                        keyDescription={"tipoNotifica"}
                        keyValue={"tipoNotifica"}
                        keyBody={"tipoNotifica"}
                        arrayValues={tipoNotificaArray}
                    ></MainFilter>
                    <MainFilter 
                        filterName={"select_value_string"}
                        inputLabel={"Risp. SEND"}
                        clearOnChangeFilter={clearOnChangeFilter}
                        setBody={setBodyGetLista}
                        body={bodyGetLista}
                        keyDescription={"ris"}
                        keyValue={"ris"}
                        keyBody={"ris"}
                        arrayValues={[]}
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
                        label: "Download file notifiche",
                        icon:{name:"download"},
                        disabled:false
                    },
                    ]}/>
                <Box sx={{ backgroundColor:'#F8F8F8', padding:'10px'}}>
                    <Table size="small" aria-label="purchases">
                        <TableHead>
                            <TableRow sx={{borderColor:"white",borderWidth:"thick"}}>
                                <TableCell align="center" sx={{ width:"300px"}} >Tipologia Fattura</TableCell>
                                <TableCell align="center" sx={{ width:"300px"}} >Tipologia Contestazione</TableCell>
                          
                                <TableCell align="center" sx={{ width:"300px"}}>Tot. Not. Analog.</TableCell>
                                <TableCell align="center" sx={{ width:"300px"}}>Tot. Not. Digit.</TableCell>
                                <TableCell align="center" sx={{ width:"300px"}}>Totale</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody sx={{borderColor:"white",borderWidth:"thick"}}>
                            {mock.map((sigleRec:RecapObjContestazioni)=>{
                                return (
                                    <TableRow key={Math.random()}>
                                        <TableCell align="center"  sx={{ width:"300px"}} >{sigleRec.tipologiaFattura}</TableCell>
                                        <TableCell align="center" sx={{ width:"300px"}} >{sigleRec.flagContestazione}</TableCell>
                                   
                                        <TableCell align="center" sx={{ width:"300px"}}>{sigleRec.totaleNotificheAnalogiche}</TableCell>
                                        <TableCell align="center" sx={{ width:"300px"}}>{sigleRec.totaleNotificheDigitali}</TableCell>
                                        <TableCell align="center" sx={{ width:"300px"}}>{sigleRec.totale}</TableCell>
                                    </TableRow>
                                );})}
                        </TableBody>
                    </Table>
                </Box>
                <GridUploadContestazioni popUp={true}></GridUploadContestazioni>
           
            </MainBoxStyled>
            
            <ModalLoading 
                open={showLoading} 
                setOpen={setShowLoading}
                sentence={"Elaborazione in corso"} >
            </ModalLoading>
        </>
    );
};

export default NotificheRispostaSend;
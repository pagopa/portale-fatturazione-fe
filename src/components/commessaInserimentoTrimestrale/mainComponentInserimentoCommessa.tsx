import { Box, Chip, Grid, IconButton, Skeleton, TextField, Tooltip, Typography } from "@mui/material";
import ColumnGrid from "../reusableComponents/columGrid";
import InputRegioni from "./inserisciRegioniModCommessa";
import PrimoContainerInsComTrimestrale from "./primoContainerTrimestrale";
import SecondoContainerTrimestrale from "./secondoContainerTrimestrale";
import TerzoContainerTrimestrale from "./terzoContainerTrimestrale";
import InfoIcon from '@mui/icons-material/Info';
import DeleteIcon from '@mui/icons-material/Delete';
import { month } from "../../reusableFunction/reusableArrayObj";
import { Regioni } from "../../page/ente/moduloCommessaInserimentoUtEn30";
import { useMemo } from "react";
import React from "react";

const MainInserimentoModuloCommessa = ({
    activeCommessa,
    onChangeModuloValue,
    isEditAllow,
    errorAnyValueIsEqualNull,
    dataTotali,
    arrayRegioniSelected,
    setArrayRegioniSelected,
    arrayRegioni,
    onAddRegioniButton,
    errorArRegioni,
    handleChangeTotale_Ar_890_regione,
    error890Regioni,
    onDeleteSingleRegione,
    dataModuli,
    activeStep,
    mainState,
    coperturaAr,
    copertura890,
    loadingData,
    coperturaArInseritaManualmente,
    copertura890InseritaManualmente
    
}) => {


    const sortedRegioni = useMemo(() => {
        if (!activeCommessa?.valoriRegione) return [];
        return [...activeCommessa.valoriRegione].sort((a, b) => {
            if (a.obbligatorio === 1 && b.obbligatorio !== 1) return -1;
            if (a.obbligatorio !== 1 && b.obbligatorio === 1) return 1;
            return 0;
        });
    }, [activeCommessa?.valoriRegione]);
    console.log({sortedRegioni});
    if(loadingData){
        return (
            <Box
                sx={{
                    padding:"24px",
                    height: '100vh'
                }}
            >
                <Skeleton variant="rectangular" height="100%" />
            </Box>
        );
    }else{
        return(
            <>
                <div>
                    <div className="bg-white mt-3 pt-3">
                        <PrimoContainerInsComTrimestrale meseAnno={`${month[Number(activeCommessa?.meseValidita)-1]}/${activeCommessa?.annoValidita}`} tipoContratto={activeCommessa?.idTipoContratto === 1 ?  "PAL":"PAC"} />
                        <SecondoContainerTrimestrale 
                            onChangeModuloValue={onChangeModuloValue }
                            dataModulo={activeCommessa}
                            meseAnno={` ${month[Number( activeCommessa?.meseValidita )-1]}/${activeCommessa?.annoValidita}`}
                            modifica={isEditAllow}
                            errorAnyValueIsEqualNull={errorAnyValueIsEqualNull} />
                    </div>
                    {(activeCommessa?.source === "archiviato" && activeCommessa?.stato !== null) &&
                        <div className='bg-white'>
                            <TerzoContainerTrimestrale dataModulo={dataTotali} dataModifica={activeCommessa?.dataInserimento} meseAnno={` ${month[Number(activeCommessa?.meseValidita)-1]}/${activeCommessa?.annoValidita}`}/>
                        </div>
                    }
                    <>
                        {activeCommessa?.source !== "archiviato" &&
                            <div  className="bg-white mt-3 pt-3 ">
                                <InputRegioni 
                                    isEditAllow={isEditAllow}
                                    selected={arrayRegioniSelected}
                                    setValue={setArrayRegioniSelected}
                                    array={arrayRegioni}
                                    action={onAddRegioniButton}
                                ></InputRegioni> 
                            </div>
                        }
                        
                        <div  className="bg-white mt-3 pt-3">
                            {activeCommessa?.valoriRegione?.length > 0 &&
                             <>
                                 <ColumnGrid 
                                     elements={[
                                         <Typography sx={{fontWeight:'bold', textAlign:'center'}}>Regioni </Typography>,<Typography sx={{fontWeight:'bold', textAlign:'center'}}>AR Nazionali </Typography>,<Typography sx={{fontWeight:'bold', textAlign:'center'}}>890 Nazionali</Typography>
                                     ]} styles={[
                                         {
                                             textAlign: 'left',
                                             borderColor: '#ffffff',
                                             borderStyle: 'solid',
                                         },{
                                             textAlign: 'left',
                                             borderColor: '#ffffff',
                                             borderStyle: 'solid',
                                         },
                                         {
                                             textAlign: 'left',
                                             borderColor: '#ffffff',
                                             borderStyle: 'solid',
                                         }
                                     ]} 
                                     columns={[6,2,2]}
                                 ></ColumnGrid>
                           
                           
                                 <hr></hr>
                             </>
                            }
                            <div>
                                {sortedRegioni.map((element) => (
                                    <div
                                        key={element.istatRegione}
                                        style={{
                                            backgroundColor: element.obbligatorio === 1  ? "#ffffff" : "#F8F8F8",
                                        }}
                                    >
                                        <Grid 
                                            container
                                            columns={12}>
                                            <Grid
                                                sx={{ display: "flex", justifyContent: "right", alignItems: "center" }}
                                                item
                                                xs={6}
                                            >  <Grid container alignItems="center" key="header">
                                                    <Grid sx={{ display: "flex", justifyContent: "right" }} item xs={10}>
                                                        <Typography variant="h4" sx={{ fontWeight: "bold", textAlign: "center" }}>
                                                            {element.regione}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={2} sx={{ textAlign: "right" }}>
                                                        {element?.obbligatorio === 1 && (
                                                            <Tooltip title="Regione di appartenenza">
                                                                <IconButton>
                                                                    <InfoIcon fontSize="medium" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        )}
                                                    </Grid>
                                                </Grid></Grid>
                                            <Grid
                                                sx={ { display: "flex", justifyContent: "center", alignItems: "center" }}
                                                item
                                                xs={2}
                                            >  <TextField
                                                    key="ar"
                                                    sx={{ backgroundColor: "#FFFFFF", width: "100px" }}
                                                    error={((element.obbligatorio === 1 && element.ar !== null) || element.obbligatorio !== 1) && ( errorArRegioni || (errorAnyValueIsEqualNull && element.ar === null))}
                                                    disabled={!isEditAllow}
                                                    onChange={(e) => handleChangeTotale_Ar_890_regione(e, "totaleAnalogicoARNaz", element)}
                                                    size="small"
                                                    value={element.ar === 0 ? 0 : element.ar || ""}
                                                    InputProps={{ inputProps: { min: 0, style: { textAlign: "center" } } }}
                                                /></Grid>
                                            <Grid
                                                sx={ { display: "flex", justifyContent: "center", alignItems: "center" }}
                                                item
                                                xs={2}
                                            > <TextField
                                                    key="890"
                                                    sx={{ backgroundColor: "#FFFFFF", width: "100px" }}
                                                    error={((element.obbligatorio === 1 && element[890]  !== null) || element.obbligatorio !== 1) && (error890Regioni || (errorAnyValueIsEqualNull && element[890] === null))}
                                                    disabled={!isEditAllow}
                                                    onChange={(e) => handleChangeTotale_Ar_890_regione(e, "totaleAnalogico890Naz", element)}
                                                    size="small"
                                                    value={element[890] === 0 ? 0 : element[890] || ""}
                                                    InputProps={{ inputProps: { min: 0, style: { textAlign: "center" } } }}
                                                /></Grid>
                                            <Grid
                                                sx={ { display: "flex", justifyContent: "center", alignItems: "center" }}
                                                item
                                                xs={2}
                                            > { isEditAllow ? (
                                                    <IconButton
                                                        key="delete"
                                                        onClick={() => onDeleteSingleRegione(element.istatRegione)}
                                                        aria-label="Delete"
                                                        sx={{ color: "#FE6666" }}
                                                        size="large"
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                ) : (
                                                    <Chip
                                                        key="chip"
                                                        variant="outlined"
                                                        sx={{ backgroundColor: element.obbligatorio === 1 && element[890] === null && element.ar === null ? undefined : element?.calcolato ? undefined : "#B5E2B4" }}
                                                        label={element.obbligatorio === 1 && element[890] === null && element.ar === null ? "Regione di appartenenza" : element?.calcolato ? "Attribuito dal sistema" : "Inserita manualmente dall’aderente"}
                                                    />
                                                )}</Grid>
                                        </Grid>
                                        <hr />
                                    </div>
                                ))}
                            </div>
                            <hr></hr>
                        </div>
                        <div className="bg-white mt-3 pt-3 ">
                            <ColumnGrid 
                                elements={[
                                    null,<Typography sx={{fontWeight:'bold', textAlign:'center'}}>AR Nazionali </Typography>,<Typography sx={{fontWeight:'bold', textAlign:'center'}}>890 Nazionali</Typography>
                                ]} styles={[
                                    {
                                        textAlign: 'left',
                                        borderColor: '#ffffff',
                                        borderStyle: 'solid',
                                    },{
                                        textAlign: 'left',
                                        borderColor: '#ffffff',
                                        borderStyle: 'solid',
                                    },
                                    {
                                        textAlign: 'left',
                                        borderColor: '#ffffff',
                                        borderStyle: 'solid',
                                    }
                                ]} 
                                columns={[6,2,2]}
                            ></ColumnGrid>
                            <hr></hr>
                            <ColumnGrid 
                                elements={[
                                    <Typography sx={{fontWeight:'bold', textAlign:'right'}}>Totale Notifiche</Typography>,
                                    <TextField
                                        sx={{ backgroundColor: '#ffffff', width: '100px'}}
                                        disabled={true}
                                        size="small"
                                        value={dataModuli.length > 1 ? (dataModuli[activeStep]?.totaleNotificheAnalogicoARNaz||0):(dataModuli[0]?.totaleNotificheAnalogicoARNaz||0)}
                                        InputProps={{ inputProps: { min: 0, style: { textAlign: 'center' }} }}
                                    />,
                                    <TextField
                                        sx={{ backgroundColor: '#ffffff', width: '100px'}}
                                        disabled={true}
                                        size="small"
                                        value={dataModuli.length > 1 ?  (dataModuli[activeStep]?.totaleNotificheAnalogico890Naz||0) : (dataModuli[0]?.totaleNotificheAnalogico890Naz||0)}
                                        InputProps={{ inputProps: { min: 0, style: { textAlign: 'center' }} }}
                                    />
                                ]} styles={[
                                    {
                                        justifyContent:"center",
                                        alignItems:"center"
                                    },{
                                        textAlign: 'center',
                                        borderColor: '#ffffff',
                                        borderStyle: 'solid',
                                    },
                                    {
                                        textAlign: 'center',
                                        borderColor: '#ffffff',
                                        borderStyle: 'solid',
                                    }
                                ]} 
                                columns={[6,2,2]}
                            ></ColumnGrid>
                            <hr></hr>
                            {(activeCommessa.source === "archiviato" && activeCommessa.valoriRegione.length === 0) ? null : 
                                <>
                                    <ColumnGrid 
                                        elements={[
                                            <Typography sx={{fontWeight:'bold', textAlign:'right'}}>Percentuale copertura inserita dell’aderente</Typography>,
                                            <TextField
                                                sx={{ backgroundColor: '#ffffff', width: '100px'}}
                                                disabled={mainState.statusPageInserimentoCommessa === 'immutable'}
                                                size="small"
                                                error={(coperturaAr||0) > 100}
                                                value={ activeCommessa?.source === "archiviato" ? (coperturaArInseritaManualmente ? coperturaArInseritaManualmente + "%" : 0+ "%"):coperturaAr ? coperturaAr + "%" : 0+ "%"}
                                                InputProps={{ inputProps: { min: 0, style: { textAlign: 'center' }} }}
                                            />,
                                            <TextField
                                                sx={{ backgroundColor: '#ffffff', width: '100px'}}
                                                disabled={mainState.statusPageInserimentoCommessa === 'immutable'}
                                                size="small"
                                                error={(copertura890||0) > 100}
                                                value={activeCommessa?.source === "archiviato" ? (copertura890InseritaManualmente ? copertura890InseritaManualmente + "%" : 0+ "%"): copertura890 ? copertura890 + "%" : 0+ "%"}
                                                InputProps={{ inputProps: { min: 0, style: { textAlign: 'center' }} }}
                                            />
                                        ]}
                                        styles={[{
                                            justifyContent:"center",
                                            alignItems:"center"
                                        },{
                                            textAlign: 'center',
                                            borderColor: '#ffffff',
                                            borderStyle: 'solid',
                                        },
                                        {
                                            textAlign: 'center',
                                            borderColor: '#ffffff',
                                            borderStyle: 'solid',
                                        }
                                        ]} 
                                        columns={[6,2,2]}
                                    ></ColumnGrid>
                           
                                    {activeCommessa?.source === "archiviato" &&
                             <>
                                 <hr></hr>
                                 <ColumnGrid 
                                     elements={[
                                         <Typography sx={{fontWeight:'bold', textAlign:'right'}}>Percentuale copertura attribuita dal sistema</Typography>,
                                         <TextField
                                             sx={{ backgroundColor: '#ffffff', width: '100px'}}
                                             disabled={mainState.statusPageInserimentoCommessa === 'immutable'}
                                             size="small"
                                             value={100 - (coperturaArInseritaManualmente||0) + "%"}
                                             InputProps={{ inputProps: { min: 0, style: { textAlign: 'center' }} }}
                                         />,
                                         <TextField
                                             sx={{ backgroundColor: '#ffffff', width: '100px'}}
                                             disabled={mainState.statusPageInserimentoCommessa === 'immutable'}
                                             size="small"
                                             value={100 - (copertura890InseritaManualmente||0) + "%"}
                                             InputProps={{ inputProps: { min: 0, style: { textAlign: 'center' }} }}
                                         />
                                     ]}
                                     styles={[{
                                         justifyContent:"center",
                                         alignItems:"center"
                                     },{
                                         textAlign: 'center',
                                         borderColor: '#ffffff',
                                         borderStyle: 'solid',
                                     },
                                     {
                                         textAlign: 'center',
                                         borderColor: '#ffffff',
                                         borderStyle: 'solid',
                                     }
                                     ]} 
                                     columns={[6,2,2]}
                                 ></ColumnGrid>
                             </>
                                    }
                                </> }
                            <hr></hr>
                            
                        </div>
                    </>
                </div>   
            </>
        );}
};
export default MainInserimentoModuloCommessa;



const RegioneRow = React.memo(({ 
    element,
    isEditAllow,
    errorAnyValueIsEqualNull,
    errorArRegioni,
    handleChangeTotale_Ar_890_regione,
    error890Regioni,
    onDeleteSingleRegione
}: {
    element: Regioni,
    isEditAllow: boolean,
    errorAnyValueIsEqualNull:boolean,
    errorArRegioni:boolean,
    handleChangeTotale_Ar_890_regione:any,
    error890Regioni:boolean,
    onDeleteSingleRegione:(el:string)=>void
}) => {

    return (
        <div
            key={element.istatRegione}
            style={{
                backgroundColor: element.obbligatorio === 1 ? "#ffffff" : "#F8F8F8",
            }}
        >
            <Grid 
                container
                columns={12}>
                <Grid
                    sx={{ display: "flex", justifyContent: "right", alignItems: "center" }}
                    item
                    xs={6}
                >  <Grid container alignItems="center" key="header">
                        <Grid sx={{ display: "flex", justifyContent: "right" }} item xs={10}>
                            <Typography variant="h4" sx={{ fontWeight: "bold", textAlign: "center" }}>
                                {element.regione}
                            </Typography>
                        </Grid>
                        <Grid item xs={2} sx={{ textAlign: "right" }}>
                            {element?.obbligatorio === 1 && (
                                <Tooltip title="Regione di appartenenza">
                                    <IconButton>
                                        <InfoIcon fontSize="medium" />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </Grid>
                    </Grid></Grid>
                <Grid
                    sx={ { display: "flex", justifyContent: "center", alignItems: "center" }}
                    item
                    xs={2}
                >  <TextField
                        key="ar"
                        sx={{ backgroundColor: "#FFFFFF", width: "100px" }}
                        error={errorArRegioni || (errorAnyValueIsEqualNull && element.ar === null)}
                        disabled={!isEditAllow}
                        onChange={(e) => handleChangeTotale_Ar_890_regione(e, "totaleAnalogicoARNaz", element)}
                        size="small"
                        value={element.ar === 0 ? 0 : element.ar || ""}
                        InputProps={{ inputProps: { min: 0, style: { textAlign: "center" } } }}
                    /></Grid>
                <Grid
                    sx={ { display: "flex", justifyContent: "center", alignItems: "center" }}
                    item
                    xs={2}
                > <TextField
                        key="890"
                        sx={{ backgroundColor: "#FFFFFF", width: "100px" }}
                        error={error890Regioni || (errorAnyValueIsEqualNull && element[890] === null)}
                        disabled={!isEditAllow}
                        onChange={(e) => handleChangeTotale_Ar_890_regione(e, "totaleAnalogico890Naz", element)}
                        size="small"
                        value={element[890] === 0 ? 0 : element[890] || ""}
                        InputProps={{ inputProps: { min: 0, style: { textAlign: "center" } } }}
                    /></Grid>
                <Grid
                    sx={ { display: "flex", justifyContent: "center", alignItems: "center" }}
                    item
                    xs={2}
                > { isEditAllow ? (
                        <IconButton
                            key="delete"
                            onClick={() => onDeleteSingleRegione(element.istatRegione)}
                            aria-label="Delete"
                            sx={{ color: "#FE6666" }}
                            size="large"
                        >
                            <DeleteIcon />
                        </IconButton>
                    ) : (
                        <Chip
                            key="chip"
                            variant="outlined"
                            sx={{ backgroundColor: element?.calcolato ? undefined : "#B5E2B4" }}
                            label={element?.calcolato ? "Attribuito dal sistema" : "Inserita manualmente dall’aderente"}
                        />
                    )}</Grid>
            </Grid>
            <hr />
        </div>
    );
},
(prev, next) => {
    // ✅ Only re-render if the value or relevant props change
    return (
        prev.element.ar === next.element.ar &&
      prev.element[890] === next.element[890] &&
      prev.isEditAllow === next.isEditAllow &&
      prev.errorArRegioni === next.errorArRegioni &&
      prev.error890Regioni === next.error890Regioni &&
      prev.errorAnyValueIsEqualNull === next.errorAnyValueIsEqualNull
    );
});
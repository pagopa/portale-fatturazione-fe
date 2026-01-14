import * as React from "react";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import { Grid, Typography, Button, ButtonProps, Tooltip } from "@mui/material";
import DownloadIcon from '@mui/icons-material/Download';
import EventNoteIcon from '@mui/icons-material/EventNote';
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown';
import IosShareIcon from '@mui/icons-material/IosShare';
import PreviewIcon from '@mui/icons-material/Preview';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ListIcon from '@mui/icons-material/List';
import DescriptionIcon from '@mui/icons-material/Description';
import GavelIcon from '@mui/icons-material/Gavel';
import DateRangeIcon from '@mui/icons-material/DateRange';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import InboxIcon from '@mui/icons-material/Inbox';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import PersonIcon from '@mui/icons-material/Person';


const MainBox = styled(Box)({
    marginLeft: "1.25rem",  
    marginRight: "1.25rem",
    padding: "1rem",
    backgroundColor: "#f3f4f6",
    borderRadius: "8px",
    minHeight: "80vh"
});

export  const MainBoxStyled = ({
    children,
    title,
    actionButton
}:{
    children?: React.ReactNode,
    title:string,
    actionButton?:{
        onButtonClick:()=> void,
        variant:"text" | "outlined" | "contained",
        label?:string,
        icon?:{name:string, sx:any},
        withText?:boolean,
        tooltipMessage?:string
    }[]
}) =>  {
    return <MainBox>
        <Grid
            container
            spacing={2}
            sx={{ alignItems: "center",mt:1 }}
        >
            {/* Typography — 9 columns */}
            <Grid item xs={12} md={9}>
                <Typography
                    variant="h4"
                    sx={{ textAlign: { xs: "center", md: "left" } }}
                >
                    {title}
                </Typography>
            </Grid>

            {/* Buttons — 3 columns */}
            <Grid 
                item 
                xs={12} 
                md={3}
                sx={{
                    display: "flex",
                    justifyContent: { xs: "center", md: "flex-end" },
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 1
                }}
            >
                {actionButton?.map((action, index) => (
                    <Tooltip key={index}  title={action?.tooltipMessage ? action?.tooltipMessage:null}>
                        <CustomButton
                            sx={{marginRight:"20%"}}
                            key={index}
                            variant={action.variant}
                            onClick={action.onButtonClick}
                            withText={action.withText}
                        >
                            {action.icon && RenderIcon(action.icon.name, false)} 
                            {action.label}
                        </CustomButton>
                    </Tooltip>
                    
                ))}
            </Grid>
        </Grid>

        {children}
    </MainBox>;
};

export  function ResponsiveGridContainer({ children, sx={}, ...rest }) {
    return (
        <Box sx={{ mt: { xs: "1rem",sm: "1.5rem",md:"2.5rem" },pb: { xs: "1rem",sm: "1.5rem",md:"1rem" } }}>
            <Grid
                container
                spacing={{
                    xs: 2,
                    sm: 3,
                    md: 4,
                    lg: 5,
                    xl: 6
                }}
                {...rest}   
                sx={{
                    ...sx     
                }}
            >
                {children}
            </Grid>
        </Box>
    );
}


export const FilterActionButtons = ({
    onButtonFiltra,
    onButtonAnnulla,
    statusAnnulla,
    disabled,
    actionButton,
    annullaButtonOptional
}:{
    onButtonFiltra:()=> void,
    onButtonAnnulla:() => void,
    statusAnnulla:string,
    disabled?:boolean
    annullaButtonOptional?:{
        onButtonClick:()=> void,
        variant:"text" | "outlined" | "contained",
        label?:string|null,
        icon?:{name:string},
        disabled?:boolean,
        tooltipMessage?:string,
        withText?:boolean
    },
    actionButton?:{
        onButtonClick:()=> void,
        variant:"text" | "outlined" | "contained",
        label?:string|null,
        icon?:{name:string},
        disabled?:boolean,
        tooltipMessage?:string,
        withText?:boolean,
        colorAction?:"inherit" | "secondary" | "primary" | "success" | "error" | "info" | "warning"
    }[]
}) =>  {

  
    return (
        <ResponsiveGridContainer>
            <Grid item xs={12}>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: { xs: "column", sm: "column",md:"row" }, 
                        justifyContent: "space-between",
                        alignItems: { xs: "stretch", sm: "center" },
                        gap: 2,
                        width: "100%",
                    }}
                >
                    {/* Left Buttons */}
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: { xs: "column", sm: "column",md:"row" }, 
                            gap: 1,
                            flexWrap: "wrap",
                        }}
                    >
                        <CustomButton onClick={onButtonFiltra} variant="contained" disabled={disabled}>
          Filtra
                        </CustomButton>
                        {statusAnnulla !== "hidden" && !annullaButtonOptional && (
                            <CustomButton onClick={onButtonAnnulla} variant="text" disabled={disabled}>
            Annulla filtri
                            </CustomButton>
                        )}
                        {statusAnnulla !== "hidden" && annullaButtonOptional && (
                            <Tooltip title={annullaButtonOptional?.tooltipMessage ? annullaButtonOptional?.tooltipMessage : null}>
                                <CustomButton onClick={onButtonAnnulla} variant={annullaButtonOptional?.variant}>
                                    {annullaButtonOptional?.label}{annullaButtonOptional.icon && RenderIcon(annullaButtonOptional.icon.name, false)} 
                                </CustomButton>
                            </Tooltip>
                            
                        )}
                    </Box>

                    {/* Right Buttons */}
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: { xs: "column", sm: "column",md:"row" },
                            gap: 1,
                            flexWrap: "wrap",
                            mt: { xs: 2, sm: 0 }, 
                        }}
                    >
                        {actionButton?.map((action, index) => (

                            <Tooltip  title={action?.tooltipMessage ? action?.tooltipMessage:null}>
                                <CustomButton
                                    key={index}
                                    variant={action.variant}
                                    onClick={action.onButtonClick}
                                    withText={action.withText}
                                    color={action.colorAction ? "error":undefined}
                                    disabled={action.disabled}
                                >
                                    {action.icon && RenderIcon(action.icon.name, false)} 
                                    {action.label}
                                </CustomButton>
                            </Tooltip>
                        ))}
                    </Box>
                </Box>
            </Grid>
        </ResponsiveGridContainer>
    );
};


export const ActionTopGrid = ({actionButtonRight,actionButtonLeft}:{
    actionButtonRight?:{
        onButtonClick:()=> void,
        variant:"text" | "outlined" | "contained",
        label?:string|null,
        icon?:{name:string},
        disabled?:boolean
    }[],
    actionButtonLeft?:{
        onButtonClick:()=> void,
        variant:"text" | "outlined" | "contained",
        label?:string|null,
        icon?:{name:string}
        disabled?:boolean
    }[]
}) => {

    return (
        <ResponsiveGridContainer>
            <Grid item xs={12}>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: { xs: "column", md: "row" }, // stack on mobile, row on desktop
                        justifyContent: "space-between", // push left/right apart
                        alignItems: { xs: "stretch", md: "center" },
                        gap: 2,
                        width: "100%",
                    
                    }}
                >
                    {/* Left Buttons */}
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: { xs: "column", md: "row" },
                            gap: 1,
                            flexWrap: "wrap",
                        }}
                    >
                        {actionButtonLeft?.map((action, index) => (
                            <CustomButton
                                key={index}
                                onClick={action.onButtonClick}
                                startIcon={action.icon && RenderIcon(action.icon.name)}
                                disabled={action.disabled}
                                variant={"text"}
                            >
                                {action.label}
                            </CustomButton>
                        ))}
                    </Box>

                    {/* Right Buttons */}
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: { xs: "column", md: "row" },
                            gap: 1,
                            flexWrap: "wrap",
                            mt: { xs: 2, md: 0 }, // add spacing when stacked
                            justifyContent: "flex-end", // align right in the row
                        }}
                    >
                        {actionButtonRight?.map((action, index) => (
                            <CustomButton
                                key={index}
                                variant={"text"}
                                onClick={action.onButtonClick}
                                startIcon={action.icon && RenderIcon(action.icon.name)}
                                disabled={action.disabled}
                                
                            >
                                {action.label}
                            </CustomButton>
                        ))}
                    </Box>
                </Box>
            </Grid>
        </ResponsiveGridContainer>
    );
};

interface CustomButtonProps extends ButtonProps {
    withText?: boolean;
    colorAction?:"inherit" | "secondary" | "primary" | "success" | "error" | "info" | "warning"
}

export const CustomButton = styled(Button)<CustomButtonProps>(({ theme, withText=true,colorAction }) => ({
    minWidth: withText ? "130px" : undefined,
    padding: withText? theme.spacing(1, 3):undefined,
    fontWeight: 500,
    textTransform: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
}));


export const RenderIcon = (iconName,sx = true) => {
    switch (iconName) {
        case "download":
            return <DownloadIcon sx={{
                marginRight:sx ? '10px':null    
            }}></DownloadIcon>;
        case "event_note":
            return <EventNoteIcon/>;
        case "circle_arrow_icon":
            return  <ArrowCircleDownIcon></ArrowCircleDownIcon>;
        case "iso_share":
            return <IosShareIcon></IosShareIcon>;
        case "preview":
            return <PreviewIcon></PreviewIcon>;
        case "restart":
            return <RestartAltIcon></RestartAltIcon>;
        case "list":
            return <ListIcon></ListIcon>;
        case "invoice":
            return <DescriptionIcon></DescriptionIcon>;
        case "contract":
            return <GavelIcon></GavelIcon>;
        case "date":
            return <DateRangeIcon fontSize={sx ? "small":"medium"}></DateRangeIcon>;
        case "status":
            return <AutorenewIcon fontSize={sx ? "small":"medium"}></AutorenewIcon>;
        case "typology":
            return <InboxIcon fontSize={sx ? "small":"medium"} ></InboxIcon>;  
        case "fase":
            return <HourglassBottomIcon fontSize={sx ? "small":"medium"} ></HourglassBottomIcon>;
        case "person":
            return <PersonIcon fontSize={sx ? "small":"medium"}></PersonIcon>;

    }
};

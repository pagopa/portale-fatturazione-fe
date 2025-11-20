import * as React from "react";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import { Grid, Typography, Button, ButtonProps } from "@mui/material";
import DownloadIcon from '@mui/icons-material/Download';
import EventNoteIcon from '@mui/icons-material/EventNote';


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
        withText?:boolean
    }[]
}) =>  {
    return <MainBox>
        <Box
            sx={{
                mt: "1.5rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexDirection: {
                    xs: "column",
                    sm: "column",
                    md:"row"   
                },
                gap: 1
            }}
        >
            <Typography
                variant="h4"
                sx={{
                    textAlign: { xs: "center", sm: "left" } 
                }}
            >
                {title}
            </Typography>
            {actionButton && (
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" }, 
                        gap: 1,
                        mt: { xs: 1, sm: 0 }
                    }}
                >
                    {actionButton.map((action, index) => (
                        <CustomButton
                            key={index}
                            variant={action.variant}
                            onClick={action.onButtonClick}
                            withText={action.withText}
                        >
                            {action.icon && RenderIcon(action.icon.name, false)} {action.label && action.label}
                        </CustomButton>
                    ))}
                </Box>
            )}
        </Box>

        {children}
    </MainBox>;
};

export  function ResponsiveGridContainer({ children, sx={}, ...rest }) {
    return (
        <Box sx={{ mt: { xs: "1rem",sm: "1.5rem",md:"2.5rem" } }}>
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
    actionButton
}:{
    onButtonFiltra:()=> void,
    onButtonAnnulla:() => void,
    statusAnnulla:string,
    actionButton?:{
        onButtonClick:()=> void,
        variant:"text" | "outlined" | "contained",
        label?:string|null,
        icon?:{name:string},
        disabled?:boolean
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
                        <CustomButton onClick={onButtonFiltra} variant="contained">
          Filtra
                        </CustomButton>
                        {statusAnnulla !== "hidden" && (
                            <CustomButton onClick={onButtonAnnulla} variant="text">
            Annulla filtri
                            </CustomButton>
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
                            <CustomButton
                                key={index}
                                variant={action.variant}
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
                        flexDirection: { xs: "column", sm: "column",md:"row" },
                        justifyContent: "space-between",
                        alignItems: { xs: "stretch", sm: "center" },
                        gap: 2,
                        width: "100%",
                        margin:1
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
                        {actionButtonLeft?.map((action, index) => (
                            <CustomButton
                                key={index}
                                variant={action.variant}
                                onClick={action.onButtonClick}
                                startIcon={action.icon && RenderIcon(action.icon.name)}
                                disabled={action.disabled}
                            >
                                {action.label}
                            </CustomButton>
                        ))}
                    </Box>

                    {/* Right Buttons */}
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: { xs: "column", sm: "column",md:"row" },
                            gap: 1,
                            flexWrap: "wrap",
                            mt: { xs: 2, sm: 0 }, // margin when stacked
                        }}
                    >
                        { actionButtonRight?.map((action, index) => (
                            <CustomButton
                                key={index}
                                variant={action.variant}
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
}

const CustomButton = styled(Button)<CustomButtonProps>(({ theme, withText=true }) => ({
    minWidth: withText ? "130px" : undefined,
    padding: theme.spacing(1, 3),
    textTransform: "none",
    fontWeight: 500,
}));


const RenderIcon = (iconName,sx = true) => {
    switch (iconName) {
        case "download":
            return <DownloadIcon sx={{
                marginRight:sx ? '10px':null    
            }}></DownloadIcon>;
        case "event_note":
            return <EventNoteIcon/>;
    }
};

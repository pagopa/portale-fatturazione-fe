import * as React from "react";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import { Grid, Typography, Button } from "@mui/material";

const MainBox = styled(Box)({
    marginLeft: "1.25rem",  
    marginRight: "1.25rem",
    padding: "1rem",
    backgroundColor: "#f3f4f6",
    borderRadius: "8px",
    minHeight: "80vh"
});

export  default function MainBoxStyled({children, title}) {
    return <MainBox>
        <Box sx={{ mt: "1.5rem" }}>
            <Typography variant="h4">{title}</Typography>
            
        </Box>
        {children}
        
    </MainBox>;
}

export  function ResponsiveGridContainer({ children, sx={}, ...rest }) {
    console.log(sx);
    return (
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
    );
}


export const FilterButtons = ({ onButtonFiltra, onButtonAnnulla, statusAnnulla }) => {
    return (
        <Grid 
            container 
            spacing={2} 
            justifyContent="center" 
            alignItems="center"
        >
            <Grid 
                item 
                xs={12}  
                sm={6}   
                md={4}  
                lg={3} 
                display="flex"
                alignItems="center"
                justifyContent="center"
            >
                <Button 
                    onClick={onButtonFiltra}
                    variant="contained"
                    fullWidth
                >
          Filtra
                </Button>
            </Grid>
            {statusAnnulla !== "hidden" && (
                <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    lg={3}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                >
                    <Button 
                        onClick={onButtonAnnulla} 
                        variant="text"
                        fullWidth
                    >
            Annulla filtri
                    </Button>
                </Grid>
            )}
        </Grid>
    );
};

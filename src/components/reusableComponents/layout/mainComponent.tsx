import * as React from "react";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import { Grid, Typography } from "@mui/material";

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
            {...rest}       // spread other props first
            sx={{
                ...sx          // merge the passed sx, optional
            }}
        >
            {children}
        </Grid>
    );
}

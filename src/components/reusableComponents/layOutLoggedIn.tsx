import { Grid } from "@mui/material";

import { Outlet } from "react-router-dom";


const Layout = ({sideNav}) => {
    return (
        <Grid sx={{ height: '100%' }} container spacing={2} columns={12}>
            <Grid item xs={2}>
                {sideNav}
            </Grid> 
            <Grid item xs={10}>
                <Outlet />
            </Grid>
            
        </Grid>
      
    );
};

export default Layout;

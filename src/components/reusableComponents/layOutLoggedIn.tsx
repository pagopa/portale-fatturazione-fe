import { Grid } from "@mui/material";

import { Outlet } from "react-router-dom";
import HeaderNavComponent from "./headerNav";
import HeaderPostLogin from "./headerPostLogin";
import FooterComponent from "./footer";


const Layout = ({sideNav}) => {
    return (
        <>
            <HeaderPostLogin/>
            <HeaderNavComponent/>
            <Grid sx={{ height: '100%' }} container spacing={2} columns={12}>
                <Grid item xs={2}>
                    {sideNav}
                </Grid> 
                <Grid item xs={10}>
                    <Outlet />
                </Grid>
            </Grid>
            <FooterComponent/>
        </>
      
    );
};

export default Layout;

import { Grid } from "@mui/material";
import { Outlet } from "react-router-dom";
import FooterComponent from "./footer";
import HeaderPostLogin from "./headerLoginLogout";
import HeaderProductAzure from "./headerProduct/headerProductAzure";
import HeaderLogAzure from "./mainHeader/headerLogInOutAzure";




const LayoutAzure = ({sideNav}) => {
    return (
        <>
            <HeaderProductAzure/>
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

export default LayoutAzure;

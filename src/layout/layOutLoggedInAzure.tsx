import { Grid } from "@mui/material";
import { Outlet } from "react-router-dom";
import HeaderProductAzure from "./headerProduct/headerProductAzure";
import HeaderLogAzure from "./mainHeader/headerLogInOutAzure";
import ScrollToTop from "../components/reusableComponents/scrollToTop";




const LayoutAzure = ({sideNav}) => {
    return (
        <>
            <HeaderLogAzure/>
            <HeaderProductAzure/>
            <ScrollToTop></ScrollToTop>
            <Grid sx={{ height: '100%' }} container spacing={2} columns={12}>
                <Grid item xs={2}>
                    {sideNav}
                </Grid> 
                <Grid item xs={10}>
                    <Outlet />
                </Grid>
            </Grid>
        </>
      
    );
};

export default LayoutAzure;

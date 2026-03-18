import { Grid } from "@mui/material";
import { Outlet } from "react-router-dom";
import HeaderProductEnte from "./headerProduct/headerProductEnte";
import HeaderLogEnte from "./mainHeader/headerLogInOutEnte";
import ScrollToTop from "../components/reusableComponents/scrollToTop";




const LayoutEnte = ({sideNav}) => {
    return (
        <>
            <HeaderLogEnte></HeaderLogEnte>
            <HeaderProductEnte/>
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

export default LayoutEnte;

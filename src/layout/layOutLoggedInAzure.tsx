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
      <Grid sx={{ flex: 1, minHeight: 0, flexWrap: 'nowrap', marginTop: 0, '& > .MuiGrid-item': { paddingTop: 0 } }} container spacing={2} columns={12}>
        <Grid item xs={2} sx={{ overflowY: 'auto' }}>
          {sideNav}
        </Grid>
        <Grid item xs={10} id="outlet-scroll" sx={{ overflowY: 'auto' }}>
          <Outlet />
        </Grid>
      </Grid>
    </>
  );
};

export default LayoutAzure;

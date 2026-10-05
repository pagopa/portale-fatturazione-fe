import { Grid } from "@mui/material";
import { Outlet } from "react-router-dom";
import HeaderProductAzure from "./headerProduct/headerProductAzure";
import HeaderLogAzure from "./mainHeader/headerLogInOutAzure";
import ScrollToTop from "../components/reusableComponents/scrollToTop";
import { useGlobalStore } from "../store/context/useGlobalStore";
import Loader from "../components/reusableComponents/loader";

const LayoutAzure = ({sideNav}) => {
  const loadingProfilo = useGlobalStore(state => state.loadingProfilo);
  return (
    <>
      <HeaderLogAzure/>
      <HeaderProductAzure/>
      <ScrollToTop></ScrollToTop>
      {loadingProfilo === true ?
        <div className="d-flex justify-content-center align-items-center" style={{height: '100vh'}}>
          <div id='loader_on_gate_pages'>
            <Loader sentence={'Caricamento del prodotto in corso...'}></Loader> 
          </div>
        </div> :
        <Grid sx={{ height: '100%' }} container spacing={2} columns={12}>
          <Grid item xs={2}>
            {sideNav}
          </Grid> 
          <Grid item xs={10}>
            <Outlet />
          </Grid>
        </Grid>
      }
    </>
  );
};

export default LayoutAzure;

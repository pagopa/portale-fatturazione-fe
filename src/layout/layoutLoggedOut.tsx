import { Box, Grid } from "@mui/material";
import FooterComponent from "./footer";
import { Outlet, useLocation } from "react-router";
import BasicAlerts from "../components/reusableComponents/modals/alert";

// pagine di solo contenuto: niente header/footer
const CONTENT_ONLY_PATHS = ["/azure", "/auth", "/auth/azure"];

const LayoutLoggedOut = () => {
  const { pathname } = useLocation();
  const contentOnly = CONTENT_ONLY_PATHS.includes(pathname.replace(/\/+$/, ""));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <BasicAlerts/>
      {/* footer dentro lo scroll: visibile solo a fine contenuto */}
      <Grid id="outlet-scroll" sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <Box sx={{ flex: '1 0 auto', display: 'flex', flexDirection: 'column' }}>
          <Outlet />
        </Box>
        {!contentOnly && <FooterComponent/>}
      </Grid>
    </Box>
  );
};
export default LayoutLoggedOut;

import { Box, CircularProgress, Typography } from "@mui/material";
import React from "react";

type LoderProp = {
    sentence : string,
    rem?:string
}

const Loader : React.FC<LoderProp> = ({sentence,rem}) => {
  return  <Box display="flex" alignItems="center" gap={2}>
    <Typography sx={{ fontSize: "18px" }} variant="subtitle2">{sentence}</Typography>
    <CircularProgress size={rem?rem:"3rem"} />
  </Box>;
};

export default Loader;
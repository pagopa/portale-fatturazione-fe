import { Box, CircularProgress, Typography } from "@mui/material";
import React, { useState } from "react";

type LoderProp = {
    sentence : string
}

const Loader : React.FC<LoderProp> = ({sentence}) => {
   
    return  <Box display="flex" alignItems="center" gap={2}>
                <Typography sx={{ fontSize: "18px" }} variant="subtitle2">{sentence}</Typography>
                <CircularProgress size="3rem" />
            </Box>

};

export default Loader;
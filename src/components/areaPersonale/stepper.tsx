import React from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import { StepperProps } from '../../types/typesGeneral';
const steps = ['Modulo Commessa', 'Conferma dati'];

const HorizontalLinearStepper: React.FC<StepperProps> = ({indexStepper}) => {

    return (
        <Box sx={{
            width: "100%"
        }}>
            <Stepper activeStep={indexStepper}>
                {steps.map(label => <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                </Step>)}
            </Stepper>
        </Box>
    );
};
export default  HorizontalLinearStepper;
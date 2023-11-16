import React from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

const steps = ['Modulo Commessa', 'Conferma dati'];



export default function HorizontalLinearStepper() {

    return (
        <Box sx={{
            width: "100%"
        }}>
            <Stepper activeStep={1}>
                {steps.map(label => <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                </Step>)}
            </Stepper>
        </Box>
    );
}

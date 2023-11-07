import React from 'react';
import { Box } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export default function GridComponent({ data }) {
  const makeColums = Object.keys(data[0]).map((singleKey) => {
    if (singleKey === 'Mese') {
      return {
        field: singleKey,
        headerClassName: 'super-app-theme--header',
        headerAlign: 'left',
        width: 160,
        renderCell: (param) => <a className="primary" href="/">{param.row.Mese}</a>
        ,

      };
    }
    return {
      field: singleKey,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'left',
      width: 160,

    };
  });

  const showDetailsButton = {
    field: 'action',
    headerName: '',
    sortable: false,
    headerAlign: 'left',
    renderCell: ((row) => (

      <ArrowForwardIcon sx={{ color: '#1976D2', cursor: 'pointer' }} onClick={() => console.log('Show page details', row)} />

    )
    ),
  };

  const columsWithButton = [...makeColums, showDetailsButton];

  return (

    <Box sx={{ width: '100%' }}>
      <DataGrid
        sx={{
          '&.MuiDataGrid-root': {
            borderStyle: 'none',
          },
          '& .MuiDataGrid-columnSeparator': {
            display: 'none',
          },
          '& .MuiDataGrid-virtualScroller': {
            backgroundColor: 'white',
          },
          '& .MuiDataGrid-footerContainer':{
            display: 'none'
          }
        }}
        rows={data}
        columns={columsWithButton}
        columnVisibilityModel={{
          id: false,
          DataPrimoAccesso: false,
          DataUltimoAccesso: false,
        }}
        autoHeight
        disableColumnMenu
       
      />
    </Box>
  );
}

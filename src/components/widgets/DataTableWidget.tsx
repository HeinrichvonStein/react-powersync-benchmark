import * as React from 'react';
import Box from '@mui/material/Box';
import {DataGrid, GridColDef} from '@mui/x-data-grid';

export type TableProps = {
    rows: any[];
    columns: GridColDef[];
};

export default function DataTableWidget(props: TableProps) {
    return (
        <Box sx={{ height: 670, width: '100%' }}>
            <DataGrid
                autoHeight={true}
                rows={props.rows?.map((r, index) => ({ ...r, id: r.id ?? index })) ?? []}
                columns={props.columns}
                initialState={{
                    pagination: {
                        paginationModel: {
                            pageSize: 10,
                        },
                    },
                }}
                pageSizeOptions={[10]}
                checkboxSelection
                disableRowSelectionOnClick
            />
        </Box>
    );
}

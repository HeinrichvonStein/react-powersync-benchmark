import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import DataTableWidget from "@/components/widgets/DataTableWidget";
import {useQuery} from "@powersync/react";
import {ListRecord, LISTS_TABLE} from "@/library/powersync/AppSchema";
import {GridColDef} from "@mui/x-data-grid";
import {Typography} from "@mui/material";

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

export default function TableTabWidget() {
    const [value, setValue] = React.useState(0);
    const { data: listResults } = useQuery<ListRecord>(`SELECT * FROM ${LISTS_TABLE}`);
    const { data: oplogResults } = useQuery(`SELECT * FROM ps_oplog`);
    const { data: crudResults } = useQuery(`SELECT * FROM ps_crud`);
    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    const listColumns: GridColDef[] = [
        { field: 'id', headerName: 'ID', type: 'string', width: 350},
        { field: 'created_at', headerName: 'created_at',type: 'string', width: 350},
        { field: 'name', headerName: 'name', type: 'string', width: 350},
        { field: 'owner_id', headerName: 'owner_id', type: 'string', width: 350}
    ];

    const opLogColumns: GridColDef[] = [
        { field: 'bucket', headerName: 'bucket', type: 'string', width: 100},
        { field: 'op_id', headerName: 'op_id',type: 'string', width: 100},
        { field: 'op', headerName: 'op', type: 'string', width: 100},
        { field: 'row_type', headerName: 'row_type', type: 'string', width: 100},
        { field: 'row_id', headerName: 'row_id', type: 'string', width: 350},
        { field: 'key', headerName: 'key', type: 'string', width: 100},
        { field: 'data', headerName: 'data', type: 'string', width: 100},
        { field: 'hash', headerName: 'hash', type: 'string', width: 100},
        { field: 'superseded', headerName: 'superseded', type: 'string', width: 100},
    ];

    const opCrudColumns: GridColDef[] = [
        { field: 'id', headerName: 'id', type: 'string', width: 150},
        { field: 'data', headerName: 'data',type: 'string', width: 1300},
        { field: 'tx_id', headerName: 'tx_id', type: 'string', width: 350},
    ];

    return (
        <>
            <Box sx={{width: '100%'}}>
                <Typography style={{margin: '5px'}} variant="h4" gutterBottom>Data Tables</Typography>
            <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
                <Tabs value={value} onChange={handleChange}>
                    <Tab label="Lists"/>
                    <Tab label="Sync Operations"/>
                    <Tab label="Upload queue"/>
                </Tabs>
            </Box>
                <TabPanel value={value} index={0}>
                    <DataTableWidget rows={listResults} columns={listColumns}/>
                </TabPanel>
            <TabPanel value={value} index={1}>
                <DataTableWidget rows={oplogResults} columns={opLogColumns}/>
            </TabPanel>
            <TabPanel value={value} index={2}>
                <DataTableWidget rows={crudResults} columns={opCrudColumns}/>
            </TabPanel>
        </Box></>
    );
}

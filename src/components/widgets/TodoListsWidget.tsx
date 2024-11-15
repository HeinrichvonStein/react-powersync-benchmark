import {ListRecord, LISTS_TABLE} from '@/library/powersync/AppSchema';
import {Box, List, TablePagination} from '@mui/material';
import {useQuery} from '@powersync/react';
import {ListItemWidget} from './ListItemWidget';
import React, {useState} from 'react';

export function TodoListsWidget() {
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [page, setPage] = useState(0);
    const {data: rowCount} = useQuery(`SELECT COUNT() as rowCount FROM ${LISTS_TABLE}`);

    const offset = page * rowsPerPage;
    const { data: listRecords } = useQuery<ListRecord & { totalCount: number }>(
        `
            SELECT ${LISTS_TABLE}.*
            FROM ${LISTS_TABLE}
            LIMIT ${rowsPerPage}
            OFFSET ${offset}
        `
    );

    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <Box>
            <TablePagination
                component="div"
                count={rowCount[0]?.rowCount || 0} // Total number of records
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Rows per page:"
                rowsPerPageOptions={[10, 100, 1000, 2000]}
            />
            <List dense={false}>
                {listRecords.map((r) => (
                    <ListItemWidget key={r.id} title={r.name ?? ''} />
                ))}
            </List>
        </Box>
    );
}
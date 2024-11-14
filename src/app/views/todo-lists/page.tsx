import {usePowerSync, useQuery} from '@powersync/react';
import {Box, styled} from '@mui/material';
import Fab from '@mui/material/Fab';
import React, {useEffect} from 'react';
import {NavigationPage} from '@/components/navigation/NavigationPage';
import {TodoListsWidget} from '@/components/widgets/TodoListsWidget';
import {LISTS_TABLE} from '@/library/powersync/AppSchema';
import {useConnector} from '@/components/providers/SystemProvider';
import {ConsolePanel} from "@/components/console";
import Stopwatch from "@/library/Stopwatch";

export default function TodoListsPage() {
    const uploadStopwatch = new Stopwatch();
    const downloadStopwatch = new Stopwatch();
    const powerSync = usePowerSync();
    const connector = useConnector();
    const [syncStatus, setSyncStatus] = React.useState(powerSync.currentStatus);
    const [logList, setLogList] = React.useState<string[]>([]);
    const {data: downloadedRows} = useQuery(`SELECT COUNT() as ps_log_count FROM ps_oplog`);
    const {data: uploadedRows} = useQuery(`SELECT COUNT() as ps_crud_count FROM ps_crud`);

    const addString = (newString: string) => {
        setLogList([...logList, newString]);
    };

    const createNewList = async (numberOfRows: number) => {
        setLogList([]);
        const insertStopwatch = new Stopwatch();

        const userID = connector?.userId;
        if (!userID) {
            throw new Error(`Could not create new lists, no userID found`);
        }

        const values = Array(numberOfRows).fill(`(uuid(), datetime(), ?, ?)`).join(", ");
        const placeholders = Array.from({length: numberOfRows}, (_, i) => [`TodoList Name-${i + 1}`, userID]).flat();

        insertStopwatch.start();
        await powerSync.execute(
            `INSERT INTO ${LISTS_TABLE} (id, created_at, name, owner_id)
             VALUES ${values}`,
            placeholders
        );
        insertStopwatch.stop();
        addString(`${new Date().toISOString()} [LocalDB] Inserted ${numberOfRows} lists in ${insertStopwatch.getElapsedTime()} ms`);
    };

    const {data: listRecords} = useQuery<{ total: number }>(`
        SELECT COUNT(*) AS total
        FROM ${LISTS_TABLE}
    `);

    const deleteLists = async () => {
        await powerSync.writeTransaction(async (tx) => {
            // Delete list record
            await tx.execute(`DELETE
                              FROM ${LISTS_TABLE}`);
        });
        setLogList([]);
    };

    // TODO Change logs to be array of strings
    useEffect(() => {
        if (uploadedRows[0]?.ps_crud_count > 0) {
            uploadStopwatch.start();
            addString(`${new Date().toISOString()} Number of rows that will be uploaded: ${uploadedRows[0]?.ps_crud_count}`);
        }
        if (uploadedRows[0]?.ps_crud_count == 0) {
            uploadStopwatch.stop();
            uploadStopwatch.reset()
        }
    }, [uploadedRows]);
    // TODO Check download time
    useEffect(() => {
        if (uploadedRows[0]) {
            addString(`${new Date().toISOString()} Number of rows that will be downloaded: ${uploadedRows[0]?.ps_crud_count}`);
        }
    }, [downloadedRows]);
    return (
        <NavigationPage title="Todo Lists">
            <Box>
                <S.Container>
                    <S.Column>
                        <ConsolePanel logs={logList}/>
                    </S.Column>
                    <S.Column>
                        Row count: {listRecords.map((r) => r.total)}
                        <div>Preview: 5</div>
                        {/*TODO Select limit*/}
                        <TodoListsWidget limit={5}/>
                    </S.Column>
                </S.Container>
                <S.FloatingActionButton onClick={() => deleteLists()} sx={{right: 20}}>
                    {'clear'}
                </S.FloatingActionButton>
                <S.FloatingActionButton onClick={() => createNewList(200)} sx={{right: 100}}>
                    {'insert 2k'}
                </S.FloatingActionButton>
                <S.FloatingActionButton onClick={() => createNewList(5000)} sx={{right: 200}}>
                    {'insert 5k'}
                </S.FloatingActionButton>
                <S.FloatingActionButton onClick={() => createNewList(10000)} sx={{right: 300}}>
                    {'insert 10k'}
                </S.FloatingActionButton>
            </Box>
        </NavigationPage>
    );
}

namespace S {
    export const FloatingActionButton = styled(Fab)`
        position: absolute;
        bottom: 20px;
        right: 20px;
        padding: 0 10px;
        min-width: auto;
        width: auto;
        height: auto;
    `;

    export const Container = styled(Box)({
        display: 'flex',
        gap: '20px',
        width: '100%',
        height: '70%',
    });

    export const Column = styled(Box)({
        flex: 1,
        padding: '20px',
        border: '1px solid grey',
        overflowY: 'auto',
        '&::-webkit-scrollbar': {
            width: '8px',
        },
        '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
        },
        '&::-webkit-scrollbar-thumb': {
            background: '#888',
            borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
            background: '#555',
        },
    });
}

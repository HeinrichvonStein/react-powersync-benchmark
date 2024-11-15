import {usePowerSync, useQuery} from '@powersync/react';
import {Box, Button, styled, Typography} from '@mui/material';
import React, {useEffect} from 'react';
import {NavigationPage} from '@/components/navigation/NavigationPage';
import {TodoListsWidget} from '@/components/widgets/TodoListsWidget';
import {LISTS_TABLE} from '@/library/powersync/AppSchema';
import {useConnector} from '@/components/providers/SystemProvider';
import {ConsoleWidget} from "@/components/widgets/ConsoleWidget";
import Stopwatch from "@/library/Stopwatch";
import TableTabWidget from "@/components/widgets/TableTabWidget";

export default function TodoListsPage() {
    const uploadStopwatch = new Stopwatch();
    const downloadStopwatch = new Stopwatch();
    const powerSync = usePowerSync();
    const connector = useConnector();
    const [syncStatus, setSyncStatus] = React.useState(powerSync.currentStatus);
    const [logList, setLogList] = React.useState<string[]>([]);
    const {data: downloadedRows} = useQuery(`SELECT COUNT() as ps_log_count FROM ps_oplog`);
    const {data: uploadQueue} = useQuery(`SELECT COUNT() as ps_crud_count FROM ps_crud`);
    const { data: oplogResults } = useQuery(`SELECT * FROM ps_oplog`);
    const { data: crudResults } = useQuery(`SELECT * FROM ps_crud`);

    React.useEffect(() => {
        const l = powerSync.registerListener({
            statusChanged: (status) => {
                setSyncStatus(status);
            }
        });
        return () => l?.();
    }, [powerSync]);


    const addString = (newString: string) => {
        setLogList([...logList, newString]);
    };

    const createNewList = async (numberOfRows: number) => {
        const insertStopwatch = new Stopwatch();

        const userID = connector?.userId;
        if (!userID) {
            throw new Error(`Could not create new lists, no userID found`);
        }

        const values = Array(numberOfRows).fill(`(uuid(), datetime(), ?, ?)`).join(", ");
        const placeholders = Array.from({length: numberOfRows}, (_, i) => [`TodoList - ${i + 1}`, userID]).flat();

        insertStopwatch.start();
        await powerSync.execute(
            `INSERT INTO ${LISTS_TABLE} (id, created_at, name, owner_id)
             VALUES ${values}`,
            placeholders
        );
        insertStopwatch.stop();
        addString(`${new Date().toISOString()} [LocalDB] Inserted ${numberOfRows} lists in ${insertStopwatch.getElapsedTime()} ms`);
        insertStopwatch.reset()
    };

    const {data: listRecords} = useQuery<{ total: number }>(`
        SELECT COUNT(*) AS total
        FROM ${LISTS_TABLE}
    `);

    const deleteLists = async () => {
        addString(`${new Date().toISOString()} Deleting all lists`);
        await powerSync.writeTransaction(async (tx) => {
            await tx.execute(`DELETE
                              FROM ${LISTS_TABLE}`);
        });
        setLogList([]);
    };

    useEffect(() => {
        const uploadQueueSize = uploadQueue[0]?.ps_crud_count;
        if (uploadQueueSize > 0) {
            uploadStopwatch.start();
            addString(`${new Date().toISOString()} Number of rows that will be uploaded: ${uploadQueueSize}`);
        }

        // if (uploadQueueSize === 0) {
        //     uploadStopwatch.stop();
        //     addString(`${new Date().toISOString()} Uploaded ${uploadQueueSize} lists in ${uploadStopwatch.getElapsedTime()} ms`);
        //     uploadStopwatch.reset()
        // }
    }, [uploadQueue]);

    useEffect(() => {
        if (syncStatus.hasSynced) {
            addString(`${new Date().toISOString()} Full Sync has been completed`);
        }
        if (!syncStatus.hasSynced) {
            addString(`${new Date().toISOString()} Waiting for sync`);
        }
    }, [syncStatus.hasSynced]);

    useEffect(() => {
        if (syncStatus?.dataFlowStatus.uploading) {
            addString(`${new Date().toISOString()} Powersync uploading data`);
        }
        if (syncStatus?.dataFlowStatus.downloading) {
            addString(`${new Date().toISOString()} Powersync downloading data`);
        }
    }, [syncStatus?.dataFlowStatus]);

    useEffect(() => {
        const downloadSize = downloadedRows[0]?.ps_log_count;
        if (downloadSize > 0) {
            // downloadStopwatch.start();
            addString(`${new Date().toISOString()} Processing ${downloadSize} sync operations`);
        }

        // if (downloadSize == 0) {
        //     downloadStopwatch.stop();
            // addString(`${new Date().toISOString()} ${downloadSize} sync operations completed in ${downloadStopwatch.getElapsedTime()} ms`);
            // downloadStopwatch.reset()
        // }
    }, [downloadedRows]);
    return (
        <NavigationPage title="Benchmark">
            <Box>
                <S.Row>
                    <S.StyledButton onClick={() => createNewList(2000)}>
                        {'insert 2k'}
                    </S.StyledButton>
                    <S.StyledButton onClick={() => createNewList(5000)} >
                        {'insert 5k'}
                    </S.StyledButton>
                    <S.StyledButton onClick={() => createNewList(10000)}>
                        {'insert 10k'}
                    </S.StyledButton>
                    <S.DangerButton onClick={() => deleteLists()}>
                        {'Empty DB'}
                    </S.DangerButton>
                </S.Row>
                <S.Container>
                    <S.Column>
                        <ConsoleWidget logs={logList}/>
                    </S.Column>
                    <S.Column>
                        <Typography style={{margin: '5px'}} variant="body1" gutterBottom>Row count: {listRecords.map((r) => r.total)}</Typography>
                        <TodoListsWidget/>
                    </S.Column>
                </S.Container>
                    <TableTabWidget />
            </Box>
        </NavigationPage>
    );
}
namespace S {
    export const Container = styled(Box)({
        display: 'flex',
        gap: '20px',
        width: '100%',
        height: '70%',
    });

    export const Row = styled(Box)({
        display: 'flex',
        justifyContent: 'right',
        paddingBottom: '5px',
        gap: '5px',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
    });

    export const StyledButton = styled(Button)({
        border: '1px solid #ccc',
        padding: '10px 20px',
        transition: 'background-color 0.3s, border-color 0.3s',
        backgroundColor: '#c3c3c3',
        color: '#000000',
        '&:hover': {
            backgroundColor: '#ee01ff',
            color: '#ffffff',
            borderColor: '#115293',
        },
    });

    export const DangerButton = styled(Button)({
        border: '1px solid #ccc',
        padding: '10px 20px',
        transition: 'background-color 0.3s, border-color 0.3s',
        backgroundColor: '#c3c3c3',
        color: '#000000',
        '&:hover': {
            backgroundColor: '#ff0000',
            color: '#ffffff',
            borderColor: '#115293',
        },
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
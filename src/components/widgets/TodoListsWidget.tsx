import {ListRecord, LISTS_TABLE, TODOS_TABLE} from '@/library/powersync/AppSchema';
import {List} from '@mui/material';
import {useQuery} from '@powersync/react';
import {ListItemWidget} from './ListItemWidget';

export type TodoListsWidgetProps = {
    limit: number;
};


export function TodoListsWidget(props: TodoListsWidgetProps) {

    const {data: listRecords} = useQuery<ListRecord & { total_tasks: number; completed_tasks: number }>(`
        SELECT ${LISTS_TABLE}.*,
               COUNT(${TODOS_TABLE}.id)                                         AS total_tasks,
               SUM(CASE WHEN ${TODOS_TABLE}.completed = true THEN 1 ELSE 0 END) as completed_tasks
        FROM ${LISTS_TABLE}
                 LEFT JOIN ${TODOS_TABLE} ON ${LISTS_TABLE}.id = ${TODOS_TABLE}.list_id
        GROUP BY ${LISTS_TABLE}.id LIMIT ${props.limit};
    `);

    return (
        <List dense={false}>
            {listRecords.map((r) => (
                <ListItemWidget
                    key={r.id}
                    title={r.name ?? ''}
                />
            ))}
        </List>
    );
}

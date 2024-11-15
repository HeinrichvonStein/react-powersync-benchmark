import React from 'react';
import Box from "@mui/material/Box";
import {List, styled} from "@mui/material";


export type ConsoleProps = {
    logs: string[];
};
export const ConsoleWidget = (props: ConsoleProps) => {
    return (
        <List>
            {props.logs.length > 0 ? props.logs.map((r, index) => (
                <S.Panel key={index}>
                    {r}
                </S.Panel>
            )) : <S.Panel>
                No logs to display
            </S.Panel>}
        </List>
    );
}

namespace S {
    export const Panel = styled(Box)`
        background-color: #2e2e2e;
        color: #e8e8e8;
        padding: 10px;
        border-radius: 1px;
        font-Family: monospace;
        font-Size: 14px;
        overflow-x: auto;
        line-Height: 1.5;
        box-Shadow: 0px 4px 8px rgba(0, 0, 0, 0.3);
        max-Width: 100%;
    `;
}
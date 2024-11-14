import React from 'react';
import {Avatar, ListItem, ListItemAvatar, ListItemButton, ListItemText, Paper, styled} from '@mui/material';
import ListIcon from '@mui/icons-material/ListAltOutlined';

export type ListItemWidgetProps = {
    title: string;
};

export const ListItemWidget: React.FC<ListItemWidgetProps> = (props) => {
    return (
        <S.MainPaper elevation={1}>
            <ListItem disablePadding>
                <ListItemButton>
                    <ListItemAvatar>
                        <Avatar>
                            <ListIcon/>
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={props.title}/>
                </ListItemButton>
            </ListItem>
        </S.MainPaper>
    );
};

export namespace S {
    export const MainPaper = styled(Paper)`
        margin-bottom: 10px;
    `;
}

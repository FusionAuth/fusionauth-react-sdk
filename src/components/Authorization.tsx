import React, { FC, ReactNode } from 'react';
import { useFusionAuthContext } from '../providers/FusionAuthProvider';

interface Props {
    authorizedRole?: string;
    children?: ReactNode;
}

export const Authorization: FC<Props> = ({ authorizedRole, children }) => {
    const { user } = useFusionAuthContext();

    const isAuthorized = authorizedRole
        ? Object.keys(user).length !== 0 && user.role === authorizedRole
        : Object.keys(user).length !== 0;

    return <>{isAuthorized && children}</>;
};

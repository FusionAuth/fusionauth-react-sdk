import React, { FC, ReactNode } from 'react';
import { useFusionAuthContext } from '../providers/FusionAuthProvider';

interface Props {
    withRole?: string;
    children?: ReactNode;
}

export const RequireAuth: FC<Props> = ({ withRole, children }) => {
    const { user } = useFusionAuthContext();

    const isAuthorized = withRole
        ? Object.keys(user).length !== 0 && user.roles.includes(withRole)
        : Object.keys(user).length !== 0;

    return <>{isAuthorized && children}</>;
};

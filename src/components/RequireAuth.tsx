import React, { FC, ReactNode } from 'react';
import { useFusionAuthContext } from '../providers/FusionAuthProvider';

interface Props {
    withRole?: string;
    children?: ReactNode;
}

export const RequireAuth: FC<Props> = ({ withRole, children }) => {
    const { user, isAuthenticated } = useFusionAuthContext();

    const isAuthorized = withRole
        ? isAuthenticated && user.roles.includes(withRole)
        : isAuthenticated;

    return <>{isAuthorized && children}</>;
};

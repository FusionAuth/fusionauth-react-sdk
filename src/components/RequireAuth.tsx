import React, { FC, PropsWithChildren } from 'react';
import { useFusionAuth } from '../providers/FusionAuthProvider';

interface Props extends PropsWithChildren {
    withRole?: string;
}

export const RequireAuth: FC<Props> = ({ withRole, children }) => {
    const { user, isAuthenticated } = useFusionAuth();

    const isAuthorized = withRole
        ? isAuthenticated && user.roles.includes(withRole)
        : isAuthenticated;

    return <>{isAuthorized && children}</>;
};

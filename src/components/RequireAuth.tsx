import React, { FC, PropsWithChildren } from 'react';
import { useFusionAuth } from '../providers/FusionAuthProvider';

interface Props extends PropsWithChildren {
    withRole?: string | string[];
}

export const RequireAuth: FC<Props> = ({ withRole, children }) => {
    const { user, isAuthenticated } = useFusionAuth();

    // Check if the user has the required role
    // withRole can be a string or an array of strings
    const hasRole = withRole
        ? ([] as string[])
              .concat(withRole)
              .some(role => user?.roles?.includes(role))
        : true;

    const isAuthorized = isAuthenticated && hasRole;

    return <>{isAuthorized && children}</>;
};

import React, { FC, PropsWithChildren } from 'react';
import { useFusionAuth } from '../providers/FusionAuthProvider';

export const Unauthenticated: FC<PropsWithChildren> = props => {
    const { isAuthenticated } = useFusionAuth();

    if (isAuthenticated) {
        return null;
    }

    return <>{props.children}</>;
};

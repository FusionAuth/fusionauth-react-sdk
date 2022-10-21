import React, { FC, ReactNode } from 'react';
import { useFusionAuthContext } from '../providers/FusionAuthProvider';

interface Props {
    role?: string;
    children?: ReactNode;
}

export const Authorization: FC<Props> = ({ role, children }) => {
    const { user } = useFusionAuthContext();

    return (
        <>
            {(role
                ? Object.keys(user).length !== 0 && user.role === role
                : Object.keys(user).length !== 0) && children}
        </>
    );
};

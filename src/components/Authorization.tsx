import React, { FC, ReactNode } from 'react';
//import { useFusionAuthContext } from '../providers/FusionAuthProvider';

interface Props {
    user: Record<string, unknown>;
    role?: string;
    children?: ReactNode;
}

export const Authorization: FC<Props> = () => {
    // user?
    //{user.role === role && children}
    return <></>;
};

import React, { FC } from 'react';
import { useFusionAuthContext } from '../providers/FusionAuthProvider';

interface Props {
    redirectURI: string;
}

export const FusionAuthLogoutButton: FC<Props> = ({ redirectURI }) => {
    const { logout } = useFusionAuthContext();

    return (
        <button
            className="fusionAuthButton"
            type="button"
            onClick={() => logout(redirectURI)}
        >
            Logout
        </button>
    );
};

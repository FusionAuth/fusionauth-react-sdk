import React, { FC } from 'react';
import { useFusionAuthContext } from '../providers/FusionAuthProvider';

interface Props {
    redirectURI: string;
    state: string;
}

export const FusionAuthLoginButton: FC<Props> = ({ redirectURI, state }) => {
    const { login } = useFusionAuthContext();

    return (
        <button
            className="fusionAuthButton"
            type="button"
            onClick={() => login(redirectURI, state)}
        >
            Login
        </button>
    );
};

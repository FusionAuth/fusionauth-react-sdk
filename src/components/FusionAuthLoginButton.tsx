import React, { FC } from 'react';
import { useFusionAuthContext } from '../providers/FusionAuthProvider';
import { styles } from 'styles/button.module.scss';

interface Props {
    state?: string;
    buttonText?: string;
}

export const FusionAuthLoginButton: FC<Props> = ({ state, buttonText }) => {
    const { login } = useFusionAuthContext();

    return (
        <button
            className={styles.fusionAuthButton}
            type="button"
            onClick={() => login(state ?? '')}
        >
            {buttonText ?? 'Login'}
        </button>
    );
};

import React, { FC } from 'react';
import { useFusionAuthContext } from '../providers/FusionAuthProvider';
import { styles } from 'styles/button.module.scss';

interface Props {
    state?: string;
    text?: string;
}

export const FusionAuthLoginButton: FC<Props> = ({ state, text }) => {
    const { login } = useFusionAuthContext();

    return (
        <button
            className={styles.fusionAuthButton}
            type="button"
            onClick={() => login(state ?? '')}
        >
            {text ?? 'Login'}
        </button>
    );
};

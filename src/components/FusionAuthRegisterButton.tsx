import React, { FC } from 'react';
import { useFusionAuthContext } from '../providers/FusionAuthProvider';
import styles from '../styles/button.module.scss';

interface Props {
    state?: string;
    text?: string;
}

export const FusionAuthRegisterButton: FC<Props> = ({ state, text }) => {
    const { register } = useFusionAuthContext();

    return (
        <button
            className={styles.fusionAuthButton}
            type="button"
            onClick={() => register(state ?? '')}
        >
            {text ?? 'Register Now'}
        </button>
    );
};

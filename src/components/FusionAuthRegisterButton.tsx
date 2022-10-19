import React, { FC } from 'react';
import { useFusionAuthContext } from '../providers/FusionAuthProvider';
import { styles } from 'styles/button.module.scss';

interface Props {
    state?: string;
    buttonText?: string;
}

export const FusionAuthRegisterButton: FC<Props> = ({ state, buttonText }) => {
    const { register } = useFusionAuthContext();

    return (
        <button
            className={styles.fusionAuthButton}
            type="button"
            onClick={() => register(state ?? '')}
        >
            {buttonText ?? 'Register Now'}
        </button>
    );
};

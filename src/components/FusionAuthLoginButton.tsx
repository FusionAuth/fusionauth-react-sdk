import React, { FC } from 'react';
import { useFusionAuthContext } from '../providers/FusionAuthProvider';
import styles from '../styles/button.module.scss';
import classnames from 'classnames';

interface Props {
    state?: string;
    text?: string;
    className?: string;
}

export const FusionAuthLoginButton: FC<Props> = ({
    state,
    text,
    className,
}) => {
    const { login } = useFusionAuthContext();

    return (
        <button
            className={classnames(styles.fusionAuthButton, className)}
            type="button"
            onClick={() => login(state ?? '')}
        >
            {text ?? 'Login'}
        </button>
    );
};

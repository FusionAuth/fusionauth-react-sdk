import React, { FC } from 'react';
import { useFusionAuth } from '../providers/FusionAuthProvider';
import styles from '../styles/button.module.scss';
import classNames from 'classnames';

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
    const { login } = useFusionAuth();

    return (
        <button
            className={classNames(styles.fusionAuthButton, className)}
            type="button"
            onClick={() => login(state ?? '')}
        >
            {text ?? 'Login'}
        </button>
    );
};

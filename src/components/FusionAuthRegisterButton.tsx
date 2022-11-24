import React, { FC } from 'react';
import { useFusionAuthContext } from '../providers/FusionAuthProvider';
import styles from '../styles/button.module.scss';
import classNames from 'classnames';

interface Props {
    state?: string;
    text?: string;
    className?: string;
}

export const FusionAuthRegisterButton: FC<Props> = ({
    state,
    text,
    className,
}) => {
    const { register } = useFusionAuthContext();

    return (
        <button
            className={classNames(styles.fusionAuthButton, className)}
            type="button"
            onClick={() => register(state ?? '')}
        >
            {text ?? 'Register Now'}
        </button>
    );
};

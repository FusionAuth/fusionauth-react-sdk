import React, { FC } from 'react';
import { useFusionAuth } from '../providers/FusionAuthProvider';
import styles from '../styles/button.module.scss';
import classNames from 'classnames';

interface Props {
    text?: string;
    className?: string;
}

export const FusionAuthLogoutButton: FC<Props> = ({ text, className }) => {
    const { logout } = useFusionAuth();

    return (
        <button
            className={classNames(styles.fusionAuthButton, className)}
            type="button"
            onClick={() => logout()}
        >
            {text ?? 'Logout'}
        </button>
    );
};

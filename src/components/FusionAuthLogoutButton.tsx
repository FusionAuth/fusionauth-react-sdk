import React, { FC } from 'react';
import { useFusionAuthContext } from '../providers/FusionAuthProvider';
import styles from '../styles/button.module.scss';
import classnames from 'classnames';

interface Props {
    text?: string;
    className?: string;
}
export const FusionAuthLogoutButton: FC<Props> = ({ text, className }) => {
    const { logout } = useFusionAuthContext();

    return (
        <button
            className={classnames(styles.fusionAuthButton, className)}
            type="button"
            onClick={() => logout()}
        >
            {text ?? 'Logout'}
        </button>
    );
};

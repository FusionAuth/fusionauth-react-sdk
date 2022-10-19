import React, { FC } from 'react';
import { useFusionAuthContext } from '../providers/FusionAuthProvider';
import { styles } from 'styles/button.module.scss';

interface Props {
    text?: string;
}
export const FusionAuthLogoutButton: FC<Props> = ({ text }) => {
    const { logout } = useFusionAuthContext();

    return (
        <button
            className={styles.fusionAuthButton}
            type="button"
            onClick={() => logout()}
        >
            {text ?? 'Logout'}
        </button>
    );
};

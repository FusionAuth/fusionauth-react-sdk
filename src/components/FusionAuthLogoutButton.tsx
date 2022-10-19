import React, { FC } from 'react';
import { useFusionAuthContext } from '../providers/FusionAuthProvider';
import { styles } from 'styles/button.module.scss';

export const FusionAuthLogoutButton: FC = () => {
    const { logout } = useFusionAuthContext();

    return (
        <button
            className={styles.fusionAuthButton}
            type="button"
            onClick={() => logout()}
        >
            Logout
        </button>
    );
};
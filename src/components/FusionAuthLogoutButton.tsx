import React, { FC } from 'react';
import { useFusionAuthContext } from '../providers/FusionAuthProvider';
import { styles } from 'styles/button.module.scss';

interface Props {
    buttonText?: string;
}
export const FusionAuthLogoutButton: FC<Props> = ({ buttonText }) => {
    const { logout } = useFusionAuthContext();

    return (
        <button
            className={styles.fusionAuthButton}
            type="button"
            onClick={() => logout()}
        >
            {buttonText ?? 'Logout'}
        </button>
    );
};

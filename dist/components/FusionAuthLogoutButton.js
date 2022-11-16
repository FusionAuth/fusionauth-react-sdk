import React from 'react';
import { useFusionAuthContext } from '../providers/FusionAuthProvider';
import styles from '../styles/button.module.scss';
export const FusionAuthLogoutButton = ({ text }) => {
    const { logout } = useFusionAuthContext();
    return (React.createElement("button", { className: styles.fusionAuthLogoutButton, type: "button", onClick: () => logout() }, text !== null && text !== void 0 ? text : 'Logout'));
};
//# sourceMappingURL=FusionAuthLogoutButton.js.map
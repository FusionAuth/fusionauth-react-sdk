import React from 'react';
import { useFusionAuthContext } from '../providers/FusionAuthProvider';
import styles from '../styles/button.module.scss';
export const FusionAuthLoginButton = ({ state, text }) => {
    const { login } = useFusionAuthContext();
    return (React.createElement("button", { className: styles.fusionAuthButton, type: "button", onClick: () => login(state !== null && state !== void 0 ? state : '') }, text !== null && text !== void 0 ? text : 'Login'));
};
//# sourceMappingURL=FusionAuthLoginButton.js.map
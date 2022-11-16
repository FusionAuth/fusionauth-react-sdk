import React from 'react';
import { useFusionAuthContext } from '../providers/FusionAuthProvider';
import styles from '../styles/button.module.scss';
export const FusionAuthRegisterButton = ({ state, text }) => {
    const { register } = useFusionAuthContext();
    return (React.createElement("button", { className: styles.fusionAuthButton, type: "button", onClick: () => register(state !== null && state !== void 0 ? state : '') }, text !== null && text !== void 0 ? text : 'Register Now'));
};
//# sourceMappingURL=FusionAuthRegisterButton.js.map
import React from 'react';
import { useFusionAuthContext } from '../providers/FusionAuthProvider';
export const RequireAuth = ({ withRole, children }) => {
    const { user } = useFusionAuthContext();
    const isAuthorized = withRole
        ? Object.keys(user).length !== 0 && user.role === withRole
        : Object.keys(user).length !== 0;
    return React.createElement(React.Fragment, null, isAuthorized && children);
};
//# sourceMappingURL=RequireAuth.js.map
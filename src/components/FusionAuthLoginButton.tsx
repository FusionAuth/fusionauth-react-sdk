import React, { FC } from "react";
import {FusionAuthProvider} from '../providers/FusionAuthProvider'

export const FusionAuthLoginButton: FC = (props) => {
    return (
        <button
            {...props}
            className='fusionAuthButton'
            type='button'
            onClick={FusionAuthProvider.login()}
        >
            Login
        </button>
    );
};
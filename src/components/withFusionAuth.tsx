import React from 'react';
import {
    FusionAuthContext,
    IFusionAuthContext,
} from '../providers/FusionAuthProvider';

export interface WithFusionAuthProps {
    fusionAuth: IFusionAuthContext;
}

export const withFusionAuth = <
    Props extends WithFusionAuthProps = WithFusionAuthProps,
>(
    Component: React.ComponentType<Props>,
) => {
    const displayName = Component.displayName;

    const FusionAuthComponent = (
        props: Omit<Props, keyof WithFusionAuthProps>,
    ) => (
        <FusionAuthContext.Consumer>
            {(fusionAuth: IFusionAuthContext) => (
                <Component {...(props as Props)} fusionAuth={fusionAuth} />
            )}
        </FusionAuthContext.Consumer>
    );

    FusionAuthComponent.displayName = displayName;

    return FusionAuthComponent;
};

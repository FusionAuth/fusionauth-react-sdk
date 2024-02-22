import React, { Component } from 'react';
import {
    withFusionAuth,
    WithFusionAuthProps,
} from '../components/withFusionAuth';
import { render } from '@testing-library/react';
import {
    FusionAuthContext,
    IFusionAuthContext,
} from '../providers/FusionAuthProvider';
import { createContextMock } from '../__tests__/mocks/createContextMock';

describe('withFusionAuth', () => {
    test('component wrapped in HOC receives context values', () => {
        const logout = jest.fn();
        renderWrappedComponent({ logout });

        expect(logout).toHaveBeenCalled();
    });
});

class WithoutFusionAuth extends Component<WithFusionAuthProps> {
    render() {
        return <div>Test Component</div>;
    }

    componentDidMount() {
        this.props.fusionAuth.logout();
    }
}

const WithFusionAuth = withFusionAuth(WithoutFusionAuth);

const renderWrappedComponent = (context: Partial<IFusionAuthContext>) => {
    const contextMock = createContextMock(context);
    render(
        <FusionAuthContext.Provider value={contextMock}>
            <WithFusionAuth />
        </FusionAuthContext.Provider>,
    );
};

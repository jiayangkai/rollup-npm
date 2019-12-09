import React, { Component } from 'react';
import { WebConfig } from "./WebConfig";
export declare const TWConfigContext: React.Context<any>;
export interface TWConfigurable {
    config?: WebConfig;
}
interface TWConfigProps {
    config?: any;
    mapStruct?: any;
    webApiClient?: any;
}
export declare class TWConfigProvider extends Component<TWConfigProps, TWConfigurable> {
    constructor(props: TWConfigProps);
    render(): JSX.Element;
}
export declare const withConfig: <T extends TWConfigurable>(WrappedComponent: React.ComponentType<T>) => ({ ...props }: {
    [x: string]: any;
}) => JSX.Element;
export {};

import { Component } from 'react';
import { TWConfigurable } from "./TWConfigProvider";
import { PlotSet, QueryResult } from "./WebConfig";
export declare type TWGeoSpec = any;
export interface TWPlotConfig {
    plotName: string;
    metricName: string;
    type?: string;
}
export declare class TWDataBundle {
    private dataBundle;
    constructor(dataBundle: any);
    plotConfig(): {
        yLabel: string;
    };
    dataPoints(): {
        date: number;
        value: number;
    }[];
}
export declare class TWPlotEvent {
    location: {
        notation: string;
        spec: any;
        path: string[];
    };
}
export declare class TWPlotSet {
    plotSet: PlotSet;
    constructor(plotSet: PlotSet);
    select(metrics: string[], geoSpec: TWGeoSpec, resolution: string): TWPlotSet;
    query(req: {
        from: number;
        to: number;
        area?: string;
    }): Promise<QueryResult>;
    query(req: {
        time: number;
        area?: string;
    }): Promise<QueryResult>;
}
export declare class TWBaseComponent<P extends TWConfigurable, S> extends Component<P, S> {
    constructor(props: P);
    timeseries(metrics: TWPlotConfig[]): TWPlotSet;
    search(domain: string, filter?: string, id?: string[]): Promise<{
        id: string;
        [domain: string]: any;
    }[]>;
}

declare class Axios {
    static get(url: string, queries?: object, _options?: object): Promise<import("axios").AxiosResponse<any>>;
    static post(url: string, data: object, _options?: object): Promise<import("axios").AxiosResponse<any>>;
    static put(url: string, data: object, _options?: object): Promise<import("axios").AxiosResponse<any>>;
    static delete(url: string, _options?: object): Promise<import("axios").AxiosResponse<any>>;
}
export { Axios };

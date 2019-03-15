export default class Filter {
    static filter(value: any, filtersConfig: any): Promise<any>;
    static isNull(value: any): boolean;
    static defaultValue(value: any, options: any): any;
    static trim(value: any): any;
    static uppercase(value: any): any;
    static lowercase(value: any): any;
    static custom(value: any, options: any): any;
}

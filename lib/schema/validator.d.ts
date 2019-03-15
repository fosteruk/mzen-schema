export default class Validator {
    static validate(value: any, validatorsConfig: any, options?: any): Promise<boolean>;
    static required(value: any, options?: any): boolean | string;
    static notNull(value: any, options?: any): any;
    static isEmpty(value: any): boolean;
    static notEmpty(value: any, options?: any): any;
    static regex(value: any, options?: any): any;
    static email(value: any, options?: any): any;
    static valueLength(value: any, options?: any): any;
    static equality(value: any, options?: any): any;
    static enumeration(value: any, options?: any): any;
    static custom(value: any, options?: any): any;
}

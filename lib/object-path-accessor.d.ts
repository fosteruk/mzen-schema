/**
 * Object Path Accessor
 *
 * Provides ability to access and modify object/array elements using a string representation of the
 * the property call path.
 *
 * A path is a string representation of an Object or Array property call path.
 * Object property names and array index values are separated with a dot '.' to form a string.
 *  For exmaple: 'prop1.some_array.0.myVariable'.
 * An asterisks can be used to match any value:
 *  For exmaple: 'prop1.some_array.*.myVariable'.
 */
export default class ObjectPathAccessor {
    /**
     * Get path
     *
     * Returns all elements matching 'path' in 'subject'.
     */
    static getPath(path: any, subject: any): string | string[];
    static setPath(path: any, value: any, subject: any): string | string[];
    static mutatePath(path: any, subject: any, mutator: any): string | string[];
    /**
     * Search Recursive
     *
     * Search 'subject' for elements matching 'pattern'.
     * Matched values may be modifed using optional mutatorFunc.
     * Returns matched value(s).
     */
    static searchRescursive(pattern: string, subject: object, mutatorFunc?: (match: string) => void, currentPath?: string, currentDepth?: number, matches?: Array<string>): string | string[];
    /**
     * Compare two paths and return true if they match
     * The first path argument can contain wild cards '*'
     * - If you want to match a literal * you need to escape it with a backslash \*
     * The second path argument is assumed to be the real path and so wild cards are ignored
     * - the value '*' is treated a literal rather than a wild card
     */
    static pathsMatch(path: any, realPath: any): boolean;
}

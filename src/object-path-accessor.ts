/**
 * Object Path Accessor
 *
 * Provides ability to access and modify object/array elements using a string representation of the
 * the property call path.
 *
 * A path is a string representation of an Object or Array property call path.
 * Object property names and array index values are separated with a dot '.' to form a string.
 *  For example: 'prop1.some_array.0.myVariable'.
 * An asterisks can be used to match any value:
 *  For example: 'prop1.some_array.*.myVariable'.
 */
export class ObjectPathAccessor
{
  /**
   * Get path
   *
   * Returns all elements matching 'path' in 'subject'.
   */
  static getPath(path:string|number, subject:any)
  {
    return ObjectPathAccessor.searchRescursive(path, subject);
  }
 /*
  * Set path
  *
  * Sets all elements matching 'path' in the given 'subject'.
  * Returns all matching elements with updated values.
  */
  static setPath(path:string|number, value:any, subject:any)
  {
    return ObjectPathAccessor.searchRescursive(path, subject, function(){
      return value;
    });
  }
  /*
  * Unset path
  *
  * Unsets all elements matching 'path' in the given 'subject'.
  */
  static unsetPath(path:string|number, subject:any)
  {
    return ObjectPathAccessor.searchRescursive(path, subject, function(){
      return undefined; // changing value to undefined causes the prop to be unset
    });
  }
  /*
  * Mutate path
  *
  * Mutates all elements matching 'path' in 'subject' using 'mutator' function.
  * Returns all matching elements with updated values.
  */
  static mutatePath(path:string|number, subject:any, mutator:(value: any) => any)
  {
    return ObjectPathAccessor.searchRescursive(path, subject, mutator);
  }
  /**
   * Search Recursive
   *
   * Search 'subject' for elements matching 'pattern'.
   * Matched values may be modifed using optional mutatorFunc.
   * Returns matched value(s).
   */
  static searchRescursive(
    pattern: string | number, 
    subject: any, 
    mutatorFunc?: (value: any) => any, 
    meta?: {
      currentPath?:string,
      currentDepth?:number,
      wilcardPath?:boolean,
      matches?:Array<any>
    }
  )
  {
    meta = meta ? meta : {};
    var currentPath = meta.currentPath ? meta.currentPath : null;
    var currentDepth = meta.currentDepth ? meta.currentDepth : 1;
    var matches = meta.matches ? meta.matches : [];

    pattern = String(pattern);
    var patternParts = pattern.split('.');
    var currentParts = patternParts.slice(0, currentDepth); // Pattern parts up to current depth
    var currentNode = currentParts[currentParts.length - 1]; // Current node value
    var depth = currentDepth + 1;

    if (currentDepth <= patternParts.length) {
      if (Array.isArray(subject)) {
        if (
          currentNode != '*' 
          && !ObjectPathAccessor.isNumber(currentNode) 
        ) {
          // Subject node is an array but pattern node is not an array operator
          // Expand pattern adding wildcard to rescurse
          var nextNode = currentNode;
          currentNode = '*';
          currentParts.pop(); // remove current node
          currentParts = currentParts.concat(['*']);
          patternParts = currentParts.concat([nextNode]).concat(patternParts.slice(currentDepth));
          pattern = patternParts.join('.');
          meta.wilcardPath = true;
        }
        // @ts-ignore - 'element' is declared but its value is never read
        subject.forEach(function(element, x){
          processElement(x);
        });
      } else {
        for (let prop in subject) {
          processElement(prop);
        }
      }
    }

    function processElement(prop:string|number)
    {
      // Element path is the full path to the current element
      let elementPath = currentPath ? currentPath + '.' + prop : String(prop);

      if (ObjectPathAccessor.pathsMatch(pattern as string, elementPath)) {
        if (typeof mutatorFunc == 'function') subject[prop] = mutatorFunc(subject[prop]);
        if (subject[prop] == undefined) {
          if (Array.isArray(subject)) {
            subject.splice(parseInt(prop as string), 1);
          } else {
            delete subject[prop];
          }
        } else {
          // Full pattern matches current element path 
          // - so add it to the list of matches
          matches.push(subject[prop]);
        }
      }

      // Only recurse into objects
      // - can be an array object but not a primitive 
      if (
        (currentNode == '*' || prop == currentNode) 
        && subject[prop] === Object(subject[prop])
      ) {
        meta.currentPath = elementPath;
        meta.currentDepth = depth;
        meta.matches = matches;
        ObjectPathAccessor.searchRescursive(pattern, subject[prop], mutatorFunc, meta);
      }
    }

    // If the pattern contains a wildcard the result should be an array. 
    // - Otherwise it should be a single value
    return patternParts.indexOf('*') !== -1 || meta.wilcardPath 
      ? matches 
      : matches[0];
  }

  static isNumber(value)
  {
    var result = false;
    if (
      value !== false 
      && value !== undefined 
      && value !== ''
    ) {
      result = !isNaN(value);
    }
    return result;
  }

  /**
   * Compare two paths and return true if they match
   * The first path argument can contain wild cards '*'
   * - If you want to match a literal * you need to escape it with a backslash \*
   * The second path argument is assumed to be the real path and so wild cards are ignored
   * - the value '*' is treated a literal rather than a wild card
   */
  static pathsMatch(path:string, realPath:string)
  {
    var p1Parts = path.split('.');
    var p2Parts = realPath.split('.');
    var result = false;
    if (p1Parts.length == p2Parts.length) {
      result = true;
      for (var x = 0; x < p1Parts.length; x++) {
        if (p1Parts[x] == '*') continue;
        if (p1Parts[x] == '\*' && p2Parts[x] == '*') continue;
        if (p1Parts[x] != p2Parts[x]) {

          result = false;
          break;
        }
      }
    }
    return result;
  }

}

export default ObjectPathAccessor;

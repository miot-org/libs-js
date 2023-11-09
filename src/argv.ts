/**
 * Function to parse the command line arguments passed in and return the value of one argument
 * @param param - the argument to look for in the command line
 * @returns the value found for the argument, or if the argument is present without an argument true, or false
 * @example
 * if the command line is `--port 8080 -n -tf`
 * ```js
 * argv('--port') // => '8080'
 * argv('-n') // => true
 * argv('-g') // => false
 * argv('-t') // => false
 * argv('-f') // => false
 * argv('-tf') // => true
 * ```
 */
export function argv(param: string): string | boolean {
  // checks the arguments list to see if the param is present. If param starts with a '-' then it will return the next
  // argument if it doesn't start with '-'
  for (let len = process.argv.length, i = 0; i < len; i++) {
    if (process.argv[i] === param) {
      if (param.startsWith('-') && i + 1 < len && !process.argv[i + 1].startsWith('-')) {
        return process.argv[i + 1];
      } else {
        return true;
      }
    }
  }
  return false;
}

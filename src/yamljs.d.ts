declare module 'yamljs' {
  export function load(path: string): any;
  export function parse(yaml: string): any;
  export function stringify(object: any, depth?: number, arrayIndent?: number): string;
}
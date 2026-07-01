/**
 * Base component interface
 */
export abstract class Component {
  enabled: boolean = true;

  abstract update(dt: number): void;
  
  onDestroy(): void {}
}

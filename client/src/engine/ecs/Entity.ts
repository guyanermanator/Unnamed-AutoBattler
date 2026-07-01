import { Vector2 } from '../math/Vector2';
import { Component } from './Component';

export interface Transform {
  position: Vector2;
  rotation: number;
  scale: Vector2;
}

/**
 * Lightweight entity with components (not a full ECS)
 */
export class Entity {
  id: string;
  name: string;
  transform: Transform;
  active: boolean = true;
  private components: Map<string, Component> = new Map();
  private static nextId: number = 0;

  constructor(name: string = 'Entity') {
    this.id = `entity_${Entity.nextId++}`;
    this.name = name;
    this.transform = {
      position: new Vector2(),
      rotation: 0,
      scale: new Vector2(1, 1),
    };
  }

  /**
   * Add a component to this entity
   */
  addComponent<T extends Component>(component: T): T {
    const className = component.constructor.name;
    this.components.set(className, component);
    return component;
  }

  /**
   * Get a component by type
   */
  getComponent<T extends Component>(type: new (...args: any[]) => T): T | undefined {
    return this.components.get(type.name) as T | undefined;
  }

  /**
   * Check if entity has a component
   */
  hasComponent<T extends Component>(type: new (...args: any[]) => T): boolean {
    return this.components.has(type.name);
  }

  /**
   * Remove a component by type
   */
  removeComponent<T extends Component>(type: new (...args: any[]) => T): void {
    const component = this.components.get(type.name);
    if (component) {
      component.onDestroy();
      this.components.delete(type.name);
    }
  }

  /**
   * Update all components
   */
  update(dt: number): void {
    if (!this.active) return;

    this.components.forEach(component => {
      if (component.enabled) {
        component.update(dt);
      }
    });
  }

  /**
   * Destroy entity and all components
   */
  destroy(): void {
    this.components.forEach(component => component.onDestroy());
    this.components.clear();
    this.active = false;
  }
}

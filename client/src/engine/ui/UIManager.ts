import { Renderer } from '../rendering/Renderer';
import { InputManager } from '../input/InputManager';
import { Button } from './widgets/Button';
import { Window } from './widgets/Window';
import { Panel } from './widgets/Panel';
import { ProgressBar } from './widgets/ProgressBar';
import { Tooltip } from './widgets/Tooltip';

/**
 * UI Manager for handling all UI widgets
 */
export class UIManager {
  private buttons: Button[] = [];
  private windows: Window[] = [];
  private panels: Panel[] = [];
  private progressBars: ProgressBar[] = [];
  private tooltips: Tooltip[] = [];

  /**
   * Add a button
   */
  addButton(button: Button): Button {
    this.buttons.push(button);
    return button;
  }

  /**
   * Add a window
   */
  addWindow(window: Window): Window {
    this.windows.push(window);
    return window;
  }

  /**
   * Add a panel
   */
  addPanel(panel: Panel): Panel {
    this.panels.push(panel);
    return panel;
  }

  /**
   * Add a progress bar
   */
  addProgressBar(progressBar: ProgressBar): ProgressBar {
    this.progressBars.push(progressBar);
    return progressBar;
  }

  /**
   * Add a tooltip
   */
  addTooltip(tooltip: Tooltip): Tooltip {
    this.tooltips.push(tooltip);
    return tooltip;
  }

  /**
   * Remove a widget
   */
  remove(widget: any): void {
    this.buttons = this.buttons.filter(b => b !== widget);
    this.windows = this.windows.filter(w => w !== widget);
    this.panels = this.panels.filter(p => p !== widget);
    this.progressBars = this.progressBars.filter(pb => pb !== widget);
    this.tooltips = this.tooltips.filter(t => t !== widget);
  }

  /**
   * Clear all widgets
   */
  clear(): void {
    this.buttons = [];
    this.windows = [];
    this.panels = [];
    this.progressBars = [];
    this.tooltips = [];
  }

  /**
   * Handle input
   */
  handleInput(input: InputManager): void {
    const mousePos = input.getMousePosition();

    // Handle mouse down
    if (input.isMousePressed(0)) {
      [...this.windows, ...this.buttons].forEach(widget => {
        if ('onMouseDown' in widget) {
          widget.onMouseDown(mousePos.x, mousePos.y);
        }
      });
    }

    // Handle mouse up
    if (input.isMouseReleased(0)) {
      [...this.windows, ...this.buttons].forEach(widget => {
        if ('onMouseUp' in widget) {
          widget.onMouseUp(mousePos.x, mousePos.y);
        }
      });
    }

    // Handle mouse move
    [...this.windows, ...this.buttons].forEach(widget => {
      if ('onMouseMove' in widget) {
        widget.onMouseMove(mousePos.x, mousePos.y);
      }
    });
  }

  /**
   * Render all widgets
   */
  render(renderer: Renderer): void {
    this.panels.forEach(panel => panel.render(renderer));
    this.windows.forEach(window => window.render(renderer));
    this.buttons.forEach(button => button.render(renderer));
    this.progressBars.forEach(pb => pb.render(renderer));
    this.tooltips.forEach(tooltip => tooltip.render(renderer));
  }
}

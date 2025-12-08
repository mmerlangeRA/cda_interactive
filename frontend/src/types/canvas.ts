export type ElementType = 'text' | 'image';

export interface BaseElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  rotation: number;
}

export interface TextElement extends BaseElement {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily: string;
  fill: string;
  width?: number;
  height?: number;
  scaleX?: number;
  scaleY?: number;
  opacity?: number;
  align?: string;
  verticalAlign?: string;
  boxBorderColor?: string;
  boxBorderWidth?: number;
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
  width: number;
  height: number;
}

export type CanvasElement = TextElement | ImageElement;

export interface CanvasState {
  elements: CanvasElement[];
  selectedId: string | null;
  stageWidth: number;
  stageHeight: number;
}

declare module 'd3-shape' {
  export interface CurveFactory {
    (context: CanvasRenderingContext2D | Path2D): {
      areaStart(): void;
      areaEnd(): void;
      lineStart(): void;
      lineEnd(): void;
      point(x: number, y: number): void;
    };
  }

  export const curveBasis: CurveFactory;
  export const curveBasisClosed: CurveFactory;
  export const curveBasisOpen: CurveFactory;
  export const curveLinear: CurveFactory;
  export const curveLinearClosed: CurveFactory;
  export const curveNatural: CurveFactory;
  export const curveStep: CurveFactory;
  export const curveStepAfter: CurveFactory;
  export const curveStepBefore: CurveFactory;
}

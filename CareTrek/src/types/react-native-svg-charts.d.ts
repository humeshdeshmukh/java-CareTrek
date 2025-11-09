declare module 'react-native-svg-charts' {
  import { ComponentType, ReactNode } from 'react';
  import { ViewStyle, StyleProp } from 'react-native';
  import { SvgProps } from 'react-native-svg';

  export interface ChartProps<T> {
    data: T[];
    style?: StyleProp<ViewStyle>;
    contentInset?: {
      top?: number;
      left?: number;
      right?: number;
      bottom?: number;
    };
    svg?: Partial<SvgProps>;
    curve?: any;
    spacingInner?: number;
    spacingOuter?: number;
    gridMin?: number;
    gridMax?: number;
    numberOfTicks?: number;
    yMin?: number | 'dataMin' | 'dataMin - 10' | ((data: any) => number);
    yMax?: number | 'dataMax' | 'dataMax + 10' | ((data: any) => number);
    xMin?: number | 'dataMin' | 'dataMin - 10' | ((data: any) => number);
    xMax?: number | 'dataMax' | 'dataMax + 10' | ((data: any) => number);
    children?: ReactNode;
  }

  export const LineChart: ComponentType<ChartProps<number>>;
  export const BarChart: ComponentType<ChartProps<number>>;
}

import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';

type FlexJustify = 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
type FlexAlign = 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse';

@Component({
  selector: 'app-flex',
  templateUrl: './flex-component.html',
  styleUrls: ['./flex-component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.display]': '"flex"',
    '[style.flex-direction]': 'flexDirection()',
    '[style.gap]': 'gapStyle()',
    '[style.justify-content]': 'justify()',
    '[style.align-items]': 'align()',
    '[style.flex-wrap]': 'wrap()',
  }
})
export class FlexComponent {
  // Whether to layout vertically
  vertical = input<boolean>(false);

  // Gap between items (can be number in px or string like '16px', '1rem')
  gap = input<number | string | [number | string, number | string]>(0);

  // Horizontal arrangement
  justify = input<FlexJustify>('flex-start');

  // Vertical alignment
  align = input<FlexAlign>('flex-start');

  // Whether to wrap
  wrap = input<FlexWrap>('nowrap');

  // Computed flex direction
  flexDirection = computed(() => this.vertical() ? 'column' : 'row');

  // Computed gap style
  gapStyle = computed(() => {
    const gapValue = this.gap();

    if (Array.isArray(gapValue)) {
      const [rowGap, columnGap] = gapValue;
      const rowGapStr = typeof rowGap === 'number' ? `${rowGap}px` : rowGap;
      const columnGapStr = typeof columnGap === 'number' ? `${columnGap}px` : columnGap;
      return `${rowGapStr} ${columnGapStr}`;
    }

    return typeof gapValue === 'number' ? `${gapValue}px` : gapValue;
  });
}


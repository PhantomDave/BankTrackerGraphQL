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
  vertical = input<boolean>(false);

  gap = input<number | string | [number | string, number | string]>([8, 8]);

  justify = input<FlexJustify>('flex-start');

  align = input<FlexAlign>('flex-start');

  wrap = input<FlexWrap>('nowrap');

  flexDirection = computed(() => this.vertical() ? 'column' : 'row');

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


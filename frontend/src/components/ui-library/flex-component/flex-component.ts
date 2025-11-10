import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

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

  // Accept only CSS-ready strings for gap (e.g., '8px', '1rem', '8px 16px', '0')
  gap = input<string>('8px');

  justify = input<FlexJustify>('flex-start');

  align = input<FlexAlign>('flex-start');

  wrap = input<FlexWrap>('nowrap');

  flexDirection = computed(() => this.vertical() ? 'column' : 'row');

  // Pass-through: consumers must provide valid CSS units
  gapStyle = computed(() => this.gap());
}

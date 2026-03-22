import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Chart, type ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-frequency-chart',
  standalone: true,
  template:
    '<div class="rb-chart"><canvas #chartCanvas data-testid="frequency-chart"></canvas></div>',
  styles: [
    `
      :host {
        display: block;
      }
      .rb-chart {
        height: 18rem;
        width: 100%;
      }
    `,
  ],
})
export class FrequencyChartComponent
  implements AfterViewInit, OnChanges, OnDestroy
{
  @ViewChild('chartCanvas')
  private readonly canvasRef?: ElementRef<HTMLCanvasElement>;

  @Input() counts: Record<number, number> = {};

  private chart?: Chart;

  ngAfterViewInit(): void {
    this.render();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['counts'] && this.chart) {
      this.updateData();
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private render(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) {
      return;
    }
    const labels = Array.from({ length: 37 }, (_, i) => String(i));
    const data = labels.map((_, p) => this.counts[p] ?? 0);
    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Observed count',
            data,
            backgroundColor: 'rgba(59, 130, 246, 0.55)',
            borderColor: 'rgba(37, 99, 235, 0.9)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { title: { display: true, text: 'Pocket' } },
          y: { title: { display: true, text: 'Count' }, beginAtZero: true },
        },
      },
    };
    this.chart?.destroy();
    this.chart = new Chart(canvas, config);
  }

  private updateData(): void {
    if (!this.chart) {
      this.render();
      return;
    }
    const data = Array.from({ length: 37 }, (_, p) => this.counts[p] ?? 0);
    this.chart.data.datasets[0].data = data;
    this.chart.update();
  }
}

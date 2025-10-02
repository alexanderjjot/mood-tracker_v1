import { ChangeDetectionStrategy, Component, input, viewChild, ElementRef, AfterViewInit, effect } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { Mood } from '../../models/mood.interface';
import * as d3 from 'd3';
import { Selection, select } from 'd3-selection';
import { scaleTime, scaleLinear } from 'd3-scale';
import { axisBottom, axisLeft } from 'd3-axis';
import { line, curveMonotoneX } from 'd3-shape';
import { timeFormat } from 'd3-time-format';

interface ChartData {
  date: Date;
  mood: number;
}

@Component({
  selector: 'app-mood-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCardModule],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Mood Trend</mat-card-title>
      </mat-card-header>
      
      <mat-card-content>
        <div #chartContainer class="chart-container">
          @if (moods().length === 0) {
            <div class="no-data">
              <p>No mood data available for the chart</p>
            </div>
          }
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .chart-container {
      position: relative;
      width: 100%;
      min-height: 300px;
    }
    
    .no-data {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      min-height: 200px;
      color: rgba(0, 0, 0, 0.54);
    }
    
    .tooltip {
      position: absolute;
      padding: 8px 12px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      border-radius: 4px;
      font-size: 14px;
      pointer-events: none;
      z-index: 10;
      opacity: 0;
      transition: opacity 0.2s;
    }
  `]
})
export class MoodChartComponent implements AfterViewInit {
  readonly moods = input<Mood[]>([]);
  private readonly chartContainer = viewChild.required<ElementRef>('chartContainer');
  
  private svg!: Selection<SVGGElement, unknown, null, undefined>;
  private readonly margin = { top: 20, right: 30, bottom: 40, left: 50 };
  private width = 0;
  private height = 0;
  private tooltip!: Selection<HTMLDivElement, unknown, null, undefined>;
  
  constructor() {
    // Update chart when moods change
    effect(() => {
      const moodsValue = this.moods();
      if (this.svg && moodsValue.length > 0) {
        this.updateChart();
      }
    });
  }
  
  ngAfterViewInit(): void {
    this.initChart();
    this.updateChart();
  }
  
  private initChart(): void {
    const containerEl = this.chartContainer().nativeElement;
    
    if (this.svg) {
      d3.select(containerEl).select('svg').remove();
    }
    
    const container = containerEl;
    this.width = container.offsetWidth - this.margin.left - this.margin.right;
    this.height = 250 - this.margin.top - this.margin.bottom;
    
    // Create SVG element
    const svg = select(container as HTMLElement)
      .append('svg')
      .attr('width', '100%')
      .attr('height', this.height + this.margin.top + this.margin.bottom);
    
    this.svg = svg.append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);
    
    // Add tooltip
    this.tooltip = select(container as HTMLElement)
      .append('div')
      .attr('class', 'tooltip');
  }
  
  private updateChart(): void {
    const moodsValue = this.moods();
    if (!moodsValue || moodsValue.length === 0) {
      return;
    }
    
    // Prepare data
    const data: ChartData[] = moodsValue
      .map((mood: Mood) => ({
        date: new Date(mood.timestamp),
        mood: mood.moodLevel
      }))
      .sort((a: ChartData, b: ChartData) => a.date.getTime() - b.date.getTime());
    
    // Clear previous chart
    this.svg.selectAll('*').remove();
    
    // Set up scales
    const x = scaleTime()
      .domain(d3.extent(data, (d: ChartData) => d.date) as [Date, Date])
      .range([0, this.width]);
    
    const y = scaleLinear()
      .domain([0.5, 5.5]) // 1-5 scale with some padding
      .nice()
      .range([this.height, 0]);
    
    // Add X axis
    this.svg.append('g')
      .attr('transform', `translate(0,${this.height})`)
      .call(axisBottom(x).ticks(5).tickFormat((d) => timeFormat('%b %d')(d as Date) as string));
    
    // Add Y axis
    this.svg.append('g')
      .call(axisLeft(y).ticks(5).tickFormat(d => d.toString()))
      .append('text')
      .attr('fill', '#000')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '0.71em')
      .attr('text-anchor', 'end')
      .text('Mood Level');
    
    // Add line
    const lineGenerator = line<ChartData>()
      .x(d => x(d.date) || 0)
      .y(d => y(d.mood) || 0)
      .curve(curveMonotoneX);
    
    this.svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#3f51b5')
      .attr('stroke-width', 3)
      .attr('d', lineGenerator);
    
    // Add dots
    this.svg.selectAll<SVGCircleElement, ChartData>('.dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', (d) => x(d.date) || 0)
      .attr('cy', (d) => y(d.mood) || 0)
      .attr('r', 5)
      .attr('fill', '#3f51b5')
      .on('mouseover', (event, d) => {
        const mouseEvent = event as MouseEvent;
        this.tooltip
          .style('opacity', '1')
          .html(`
            <div><strong>Date:</strong> ${timeFormat('%b %d, %Y')(d.date)}</div>
            <div><strong>Mood:</strong> ${this.getMoodLabel(d.mood)}</div>
          `)
          .style('left', (mouseEvent.pageX + 10) + 'px')
          .style('top', (mouseEvent.pageY - 10) + 'px');
      })
      .on('mouseout', () => {
        this.tooltip.style('opacity', '0');
      });
    
    // Add grid lines
    this.svg.append('g')
      .attr('class', 'grid')
      .call(axisLeft(y)
        .tickSize(-this.width)
        .tickFormat(() => '')
      )
      .selectAll('.tick line')
      .attr('stroke', '#e0e0e0')
      .attr('stroke-dasharray', '2,2');
  }
  
  private getMoodLabel(level: number): string {
    const labels = ['Very Bad', 'Bad', 'Neutral', 'Good', 'Very Good'];
    return labels[Math.round(level) - 1] || 'Unknown';
  }
}
import { Injectable } from '@angular/core';
import { Mood } from '../models/mood.interface';

@Injectable({
  providedIn: 'root'
})
export class DataExportService {
  /**
   * Exports mood data as a JSON file
   */
  exportToJson(data: Mood[], filename: string = 'mood-export'): void {
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${filename}-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }

  /**
   * Exports mood data as a CSV file
   */
  exportToCsv(data: Mood[], filename: string = 'mood-export'): void {
    const headers = ['Date', 'Mood Level', 'Mood Label', 'Notes'];
    const csvContent = [
      headers.join(','),
      ...data.map(mood => {
        const date = new Date(mood.timestamp).toISOString();
        const moodLabel = this.getMoodLabel(mood.moodLevel);
        const notes = `"${(mood.notes || '').replace(/"/g, '""')}"`; // Escape quotes in notes
        return `${date},${mood.moodLevel},${moodLabel},${notes}`;
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Imports data from a file
   */
  importFromFile(file: File): Promise<Mood[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          let data: Mood[] = [];
          
          if (file.name.endsWith('.json')) {
            data = this.parseJsonImport(content);
          } else if (file.name.endsWith('.csv')) {
            data = this.parseCsvImport(content);
          } else {
            throw new Error('Unsupported file format');
          }
          
          resolve(data);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
      
      reader.readAsText(file);
    });
  }

  private parseJsonImport(content: string): Mood[] {
    const data = JSON.parse(content);
    
    if (!Array.isArray(data)) {
      throw new Error('Invalid data format: Expected an array of mood entries');
    }
    
    // Validate each entry
    return data.map((entry, index) => {
      if (!entry.timestamp || !entry.moodLevel) {
        throw new Error(`Invalid entry at index ${index}: Missing required fields`);
      }
      
      return {
        id: entry.id || Date.now().toString() + index,
        timestamp: new Date(entry.timestamp),
        moodLevel: entry.moodLevel,
        notes: entry.notes || ''
      };
    });
  }

  private parseCsvImport(content: string): Mood[] {
    const lines = content.split('\n').filter(line => line.trim() !== '');
    if (lines.length < 2) {
      throw new Error('CSV file is empty or has no data rows');
    }
    
    // Skip header row and parse data rows
    return lines.slice(1).map((line, index) => {
      const values = this.parseCsvLine(line);
      
      if (values.length < 2) {
        throw new Error(`Invalid data in row ${index + 2}`);
      }
      
      const timestamp = new Date(values[0]);
      if (isNaN(timestamp.getTime())) {
        throw new Error(`Invalid date in row ${index + 2}`);
      }
      
      const moodLevel = parseInt(values[1], 10);
      if (isNaN(moodLevel) || moodLevel < 1 || moodLevel > 5) {
        throw new Error(`Invalid mood level in row ${index + 2}`);
      }
      
      return {
        id: Date.now().toString() + index,
        timestamp,
        moodLevel,
        notes: values[3] || ''
      };
    });
  }

  private parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let inQuotes = false;
    let currentValue = '';
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        // Handle escaped quotes ("")
        if (i + 1 < line.length && line[i + 1] === '"') {
          currentValue += '"';
          i++; // Skip the next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(currentValue);
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    
    // Add the last value
    result.push(currentValue);
    
    return result;
  }

  private getMoodLabel(level: number): string {
    const labels = ['Very Bad', 'Bad', 'Neutral', 'Good', 'Very Good'];
    return labels[level - 1] || 'Unknown';
  }
}

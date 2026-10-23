import type { ClassificationResult } from '../data/index.js';

export interface ContentClassifier {
  classify(content: string): Promise<ClassificationResult>;
}

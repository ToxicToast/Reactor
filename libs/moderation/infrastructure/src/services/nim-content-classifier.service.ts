import type {
  ClassificationResult,
  ContentClassifier,
} from '@toxictoast/moderation-application';
import { Verdict, type Classification } from '@toxictoast/moderation-domain';
import {
  CLASSIFICATION_SCHEMA,
  MODERATION_PROMPT_VERSION,
  MODERATION_SYSTEM_PROMPT,
} from '../constants/index.js';
import { isClassification } from '../functions/index.js';
import type { ChatCompletionResponse, NimConfig } from '../interfaces/index.js';

export class NimContentClassifier implements ContentClassifier {
  constructor(
    private readonly config: NimConfig,
    private readonly fetcher: typeof fetch = fetch,
  ) {}

  async classify(content: string): Promise<ClassificationResult> {
    const response = await this.fetcher(
      `${this.config.baseUrl}/chat/completions`,
      {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify(this.body(content)),
        signal: AbortSignal.timeout(this.config.timeoutMs),
      },
    );
    if (!response.ok) {
      throw new Error(`NIM request failed with status ${response.status}`);
    }

    const completion = (await response.json()) as ChatCompletionResponse;
    return {
      classification: this.parse(completion),
      model: this.config.model,
      prompt_version: MODERATION_PROMPT_VERSION,
    };
  }

  private headers(): Record<string, string> {
    const headers: Record<string, string> = {
      'content-type': 'application/json',
      accept: 'application/json',
    };
    if (this.config.apiKey) {
      headers['authorization'] = `Bearer ${this.config.apiKey}`;
    }
    return headers;
  }

  private body(content: string): object {
    const system = `${MODERATION_SYSTEM_PROMPT}\n\nJSON schema:\n${JSON.stringify(CLASSIFICATION_SCHEMA)}`;
    const comment = content.replaceAll('</comment>', '<\\/comment>');
    return {
      model: this.config.model,
      temperature: 0,
      max_tokens: this.config.maxTokens,
      stream: false,
      chat_template_kwargs: { enable_thinking: this.config.thinking },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: `<comment>\n${comment}\n</comment>` },
      ],
      guided_json: CLASSIFICATION_SCHEMA,
    };
  }

  private parse(completion: ChatCompletionResponse): Classification {
    const choice = completion.choices?.[0];
    const finish = choice?.finish_reason ?? 'unknown';
    const text = choice?.message?.content;
    if (typeof text !== 'string' || text.trim().length === 0) {
      return this.invalid(`empty response (finish_reason: ${finish})`);
    }

    try {
      const value: unknown = JSON.parse(text);
      if (isClassification(value)) {
        return value;
      }
      return this.invalid(
        `response does not match the schema (finish_reason: ${finish})`,
      );
    } catch {
      return this.invalid(
        `response is not valid json (finish_reason: ${finish})`,
      );
    }
  }

  private invalid(reason: string): Classification {
    return {
      verdict: Verdict.UNCERTAIN,
      confidence: 0,
      reason: `classifier output unusable: ${reason}`,
    };
  }
}

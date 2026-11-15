import { AIPromptParams } from '@memberjunction/ai-core-plus';
import { AIEngineBase } from '@memberjunction/ai-engine-base';
import { AIPromptRunner } from '@memberjunction/ai-prompts';
import { UserInfo } from '@memberjunction/core';

/** Recursive JSON-serializable value, used for the AI prompt data bag. */
export type PromptDataValue = string | number | boolean | null | PromptDataValue[] | { [key: string]: PromptDataValue };

export interface PromptExecutionResult<T> {
  Success: boolean;
  Result: T | null;
  PromptRunID: string | null;
}

/**
 * Thin abstraction over `AIPromptRunner` so `ReferralAIRationaleService` can be
 * unit-tested with a fake executor instead of exercising a real AI model call.
 */
export interface IReferralPromptExecutor {
  ExecutePrompt<T>(promptName: string, data: Record<string, PromptDataValue>, contextUser: UserInfo): Promise<PromptExecutionResult<T>>;
}

/**
 * Default `IReferralPromptExecutor` backed by the real MJ AI Prompts subsystem:
 * looks up the named prompt via `AIEngineBase.Instance.Prompts` and executes it
 * with `AIPromptRunner`. Returns `Success: false` (never throws) when the prompt
 * isn't configured, the model run fails, or no output was produced.
 */
export class MJReferralPromptExecutor implements IReferralPromptExecutor {
  public async ExecutePrompt<T>(
    promptName: string,
    data: Record<string, PromptDataValue>,
    contextUser: UserInfo,
  ): Promise<PromptExecutionResult<T>> {
    await AIEngineBase.Instance.Config(false, contextUser);
    const prompt = AIEngineBase.Instance.Prompts.find((p) => p.Name.trim().toLowerCase() === promptName.trim().toLowerCase());
    if (!prompt) {
      return { Success: false, Result: null, PromptRunID: null };
    }

    const params = new AIPromptParams();
    params.prompt = prompt;
    params.contextUser = contextUser;
    params.data = data;

    const runner = new AIPromptRunner();
    const result = await runner.ExecutePrompt<T>(params);
    return {
      Success: result.success === true && result.result != null,
      Result: result.result ?? null,
      PromptRunID: result.promptRun?.ID ?? null,
    };
  }
}

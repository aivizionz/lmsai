import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as GoogleGenAIModule from '@google/genai';
import { JsonComplianceMetric, RelevancyMetric } from './eval-framework';
import { MOCK_CURRICULUM } from './test-data';

// Mocking @google/genai SDK
vi.mock('@google/genai', () => {
  return {
    Type: {
      OBJECT: 'OBJECT',
      STRING: 'STRING',
      ARRAY: 'ARRAY',
      NUMBER: 'NUMBER',
      INTEGER: 'INTEGER',
    },
    GoogleGenAI: vi.fn(),
  };
});

describe('Enterprise LLM Evaluation (Agentic QA)', () => {
  let generateContentMock: any;

  beforeEach(() => {
    vi.clearAllMocks();
    generateContentMock = vi.fn();
    (GoogleGenAIModule.GoogleGenAI as any).mockImplementation(() => ({
      models: {
        generateContent: generateContentMock
      }
    }));
  });

  it('Evaluates JSON Compliance of the Curriculum Agent', async () => {
    // 1. Simulate Agent Output (Happy Path)
    const agentOutput = JSON.stringify(MOCK_CURRICULUM);
    
    // 2. Run Metric
    const metric = new JsonComplianceMetric();
    const result = await metric.evaluate("Create a course", agentOutput);

    // 3. Assert
    expect(result.pass).toBe(true);
    expect(result.score).toBe(1);
    expect(result.reason).toBe("Valid JSON");
  });

  it('Fails JSON Compliance on malformed output', async () => {
    // 1. Simulate Agent Output (Bad Output)
    const agentOutput = "Here is your JSON: { title: ... (cut off)";
    
    // 2. Run Metric
    const metric = new JsonComplianceMetric();
    const result = await metric.evaluate("Create a course", agentOutput);

    // 3. Assert
    expect(result.pass).toBe(false);
    expect(result.score).toBe(0);
  });

  it('Evaluates Semantic Relevancy using LLM-as-a-Judge', async () => {
    // 1. Setup the Judge's Response
    // We mock the AI call that happens INSIDE RelevancyMetric.evaluate
    generateContentMock.mockResolvedValueOnce({
      text: JSON.stringify({
        score: 0.95,
        reason: "The curriculum covers Python basics as requested."
      })
    });

    // 2. Input/Output to evaluate
    const userPrompt = "Create a Python course for beginners";
    const agentOutput = JSON.stringify(MOCK_CURRICULUM);

    // 3. Run Relevancy Metric
    const metric = new RelevancyMetric();
    const result = await metric.evaluate(userPrompt, agentOutput);

    // 4. Assert
    // Verify the Judge was called
    expect(generateContentMock).toHaveBeenCalled();
    const judgePrompt = generateContentMock.mock.calls[0][0].contents;
    expect(judgePrompt).toContain("You are an AI Evaluator");
    expect(judgePrompt).toContain(userPrompt);

    // Verify Result
    expect(result.pass).toBe(true);
    expect(result.score).toBe(0.95);
    expect(result.reason).toContain("Python basics");
  });

  it('Integration: Generates Curriculum AND Evaluates it (End-to-End QA)', async () => {
    // This test simulates the full pipeline: Generate -> Judge

    // Call 1: The Curriculum Agent generating the content
    generateContentMock.mockResolvedValueOnce({
      text: JSON.stringify(MOCK_CURRICULUM)
    });

    // Call 2: The Relevancy Judge evaluating the content
    generateContentMock.mockResolvedValueOnce({
      text: JSON.stringify({
        score: 0.8,
        reason: "Good structure but short duration."
      })
    });

    // --- Step A: Generation ---
    const userPrompt = "Create a robust Python course";
    
    // Simulate App Logic (simplified for test)
    const ai = new GoogleGenAIModule.GoogleGenAI({ apiKey: 'test' });
    const genResponse = await ai.models.generateContent({ 
        model: 'gemini-2.5-flash', 
        contents: userPrompt 
    });
    const generatedContent = genResponse.text;

    // --- Step B: Evaluation ---
    const compliance = new JsonComplianceMetric();
    const relevancy = new RelevancyMetric();

    const complianceResult = await compliance.evaluate(userPrompt, generatedContent);
    const relevancyResult = await relevancy.evaluate(userPrompt, generatedContent);

    // --- Step C: Assertions ---
    expect(complianceResult.pass).toBe(true);
    expect(relevancyResult.pass).toBe(true);
    expect(relevancyResult.score).toBe(0.8);
    
    // Ensure we made 2 calls (1 for gen, 1 for judge)
    expect(generateContentMock).toHaveBeenCalledTimes(2);
  });
});

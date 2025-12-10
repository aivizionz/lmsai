import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { App } from '../index';
import * as GoogleGenAIModule from '@google/genai';
import { MOCK_CURRICULUM, MOCK_ASSESSMENT, MOCK_ADAPTED_CURRICULUM } from './test-data';

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

describe('System Reliability & Integration', () => {
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

  it('handles API errors gracefully', async () => {
    render(<App />);
    
    // Force API failure
    generateContentMock.mockRejectedValue(new Error("API Overloaded"));
    
    const input = screen.getByTestId('chat-input');
    fireEvent.change(input, { target: { value: 'Trigger Error' } });
    fireEvent.click(screen.getByTestId('send-button'));

    // Should verify typing stops
    await waitFor(() => {
      expect(screen.queryByText('Thinking...')).toBeNull();
    });

    // Should verify error message in chat. 
    // The store catches the error and outputs "Error: [message]"
    expect(screen.getByText(/Error: API Overloaded/i)).toBeDefined();
  });

  it('persists state when switching between tabs', async () => {
    render(<App />);
    
    // 1. Generate Curriculum
    generateContentMock.mockResolvedValueOnce({ text: JSON.stringify(MOCK_CURRICULUM) });
    fireEvent.change(screen.getByTestId('chat-input'), { target: { value: 'Init' } });
    fireEvent.click(screen.getByTestId('send-button'));
    await waitFor(() => screen.getByText('Python for Beginners'));

    // 2. Switch to Coach
    fireEvent.click(screen.getByTestId('nav-coach'));
    expect(screen.getByText('Coach Assistant Agent')).toBeDefined();
    // Curriculum view should still be visible on the right
    expect(screen.getByText('Python for Beginners')).toBeDefined();

    // 3. Switch to Adaptive
    fireEvent.click(screen.getByTestId('nav-adaptive'));
    expect(screen.getByText('Adaptive Learning Agent')).toBeDefined();
    expect(screen.getByText('Python for Beginners')).toBeDefined();

    // 4. Switch back to Curriculum
    fireEvent.click(screen.getByTestId('nav-curriculum'));
    expect(screen.getByText('Python for Beginners')).toBeDefined();
  });

  it('toggles module details in curriculum view', async () => {
    render(<App />);
    
    // Setup Curriculum
    generateContentMock.mockResolvedValueOnce({ text: JSON.stringify(MOCK_CURRICULUM) });
    fireEvent.change(screen.getByTestId('chat-input'), { target: { value: 'Init' } });
    fireEvent.click(screen.getByTestId('send-button'));
    await waitFor(() => screen.getByText('Python for Beginners'));

    // Initial State: Module 0 is expanded by default (logic in CurriculumView: {0: true})
    // "Install Python" is in Module 0
    expect(screen.getByText('Install Python')).toBeDefined();
    // "Int and Strings" is in Module 1, which should be collapsed
    expect(screen.queryByText('Int and Strings')).toBeNull();

    // 1. Collapse Module 0
    fireEvent.click(screen.getByText('Introduction')); // Click the title
    await waitFor(() => {
      expect(screen.queryByText('Install Python')).toBeNull();
    });

    // 2. Expand Module 1
    fireEvent.click(screen.getByText('Variables')); // Click the title
    await waitFor(() => {
      expect(screen.getByText('Int and Strings')).toBeDefined();
    });
  });

  it('End-to-End Flow: Create -> Adapt -> Verify Context Passed', async () => {
    render(<App />);

    // 1. Phase 1: Create
    generateContentMock.mockResolvedValueOnce({ text: JSON.stringify(MOCK_CURRICULUM) });
    fireEvent.change(screen.getByTestId('chat-input'), { target: { value: 'Start' } });
    fireEvent.click(screen.getByTestId('send-button'));
    await waitFor(() => screen.getByText('Introduction'));

    // 2. Phase 3: Adapt
    fireEvent.click(screen.getByTestId('nav-adaptive'));
    generateContentMock.mockResolvedValueOnce({ text: JSON.stringify(MOCK_ADAPTED_CURRICULUM) });
    fireEvent.change(screen.getByTestId('chat-input'), { target: { value: 'Adapt' } });
    fireEvent.click(screen.getByTestId('send-button'));
    
    await waitFor(() => {
      expect(screen.getByText('Advanced Introduction')).toBeDefined();
    });

    // 3. Phase 2: Assessment (Verify it uses the NEW adapted curriculum)
    fireEvent.click(screen.getByTestId('nav-assessment'));
    generateContentMock.mockResolvedValueOnce({ text: JSON.stringify(MOCK_ASSESSMENT) });
    fireEvent.change(screen.getByTestId('chat-input'), { target: { value: 'Assess' } });
    fireEvent.click(screen.getByTestId('send-button'));

    await waitFor(() => {
      expect(generateContentMock).toHaveBeenCalledTimes(3);
    });

    // Crucial Step: Verify the 3rd call (Assessment) contained the ADAPTED curriculum in the prompt
    const assessmentCallArgs = generateContentMock.mock.calls[2][0];
    const promptContent = assessmentCallArgs.contents;
    
    // Should contain data from MOCK_ADAPTED_CURRICULUM ("Deep dive into internals")
    expect(promptContent).toContain("Deep dive into internals");
    // Should NOT contain data specific only to the old one ("Setup and Basics") which was replaced
    expect(promptContent).not.toContain("Setup and Basics");
  });
});

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { App } from '../index';
import * as GoogleGenAIModule from '@google/genai';
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

describe('Phase 4: Coach Assistant Agent', () => {
  let generateContentMock: any;
  let generateContentStreamMock: any;

  beforeEach(() => {
    vi.clearAllMocks();
    generateContentMock = vi.fn();
    generateContentStreamMock = vi.fn();
    (GoogleGenAIModule.GoogleGenAI as any).mockImplementation(() => ({
      models: {
        generateContent: generateContentMock,
        generateContentStream: generateContentStreamMock
      }
    }));
  });

  it('provides text-based advice based on curriculum context', async () => {
    render(<App />);

    // Generate Base (Curriculum Mode uses generateContent)
    generateContentMock.mockResolvedValueOnce({ text: JSON.stringify(MOCK_CURRICULUM) });
    fireEvent.change(screen.getByTestId('chat-input'), { target: { value: 'Create course' } });
    fireEvent.click(screen.getByTestId('send-button'));
    await waitFor(() => screen.getByText('Python for Beginners'));

    // Switch to Coach
    const navCoach = screen.getByTestId('nav-coach');
    fireEvent.click(navCoach);

    // Mock Streaming Response (Coach Mode uses generateContentStream)
    generateContentStreamMock.mockReturnValue({
      [Symbol.asyncIterator]: async function* () {
        yield { text: "Here is some advice." };
      }
    });

    fireEvent.change(screen.getByTestId('chat-input'), { target: { value: 'Help' } });
    fireEvent.click(screen.getByTestId('send-button'));

    await waitFor(() => {
      expect(screen.getByText(/Here is some advice/)).toBeDefined();
    });
  });
});

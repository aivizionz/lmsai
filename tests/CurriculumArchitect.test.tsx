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

describe('Phase 1: Curriculum Architect', () => {
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

  it('renders the initial UI correctly', () => {
    render(<App />);
    expect(screen.getByText('Curriculum Architect')).toBeDefined();
    expect(screen.getByText('Phase 1: Structure Design')).toBeDefined();
    expect(screen.getByTestId('curriculum-empty-state')).toBeDefined();
  });

  it('generates and displays a curriculum when prompted', async () => {
    render(<App />);

    generateContentMock.mockResolvedValueOnce({
      text: JSON.stringify(MOCK_CURRICULUM)
    });

    const input = screen.getByTestId('chat-input');
    fireEvent.change(input, { target: { value: 'Create a Python course' } });
    fireEvent.click(screen.getByTestId('send-button'));

    expect(screen.getByText('Thinking...')).toBeDefined();

    await waitFor(() => {
      expect(generateContentMock).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByTestId('curriculum-view')).toBeDefined();
    });
    expect(screen.getByText('Python for Beginners')).toBeDefined();
  });
});

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { App } from '../index';
import * as GoogleGenAIModule from '@google/genai';
import { MOCK_CURRICULUM, MOCK_ADAPTED_CURRICULUM } from './test-data';

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

describe('Phase 3: Adaptive Learning Agent', () => {
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

  it('warns user when attempting adaptation without an existing curriculum', async () => {
      render(<App />);
      const navAdaptive = screen.getByTestId('nav-adaptive');
      fireEvent.click(navAdaptive);

      const adaptiveInput = screen.getByTestId('chat-input');
      fireEvent.change(adaptiveInput, { target: { value: 'Make it advanced' } });
      fireEvent.click(screen.getByTestId('send-button'));

      expect(generateContentMock).not.toHaveBeenCalled();
      await waitFor(() => {
        expect(screen.getByText(/I cannot adapt a curriculum that doesn't exist yet/i)).toBeDefined();
      });
    });

  it('successfully adapts an existing curriculum', async () => {
    render(<App />);

    // Generate Base
    generateContentMock.mockResolvedValueOnce({ text: JSON.stringify(MOCK_CURRICULUM) });
    fireEvent.change(screen.getByTestId('chat-input'), { target: { value: 'Create course' } });
    fireEvent.click(screen.getByTestId('send-button'));
    await waitFor(() => screen.getByText('Python for Beginners'));

    // Adapt
    const navAdaptive = screen.getByTestId('nav-adaptive');
    fireEvent.click(navAdaptive);

    generateContentMock.mockResolvedValueOnce({ text: JSON.stringify(MOCK_ADAPTED_CURRICULUM) });
    fireEvent.change(screen.getByTestId('chat-input'), { target: { value: 'Make it advanced' } });
    fireEvent.click(screen.getByTestId('send-button'));

    await waitFor(() => {
      expect(screen.getByText('Advanced Introduction')).toBeDefined(); 
    });
  });
});

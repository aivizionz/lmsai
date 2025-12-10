import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { App } from '../index';
import * as GoogleGenAIModule from '@google/genai';
import { MOCK_CURRICULUM, MOCK_ASSESSMENT } from './test-data';

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

describe('Phase 2: Assessment & Grading Agent', () => {
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

  it('switches to Assessment mode and warns if no curriculum exists', async () => {
    render(<App />);
    
    const navAssessment = screen.getByTestId('nav-assessment');
    fireEvent.click(navAssessment);

    expect(screen.getByText('Assessment Designer')).toBeDefined();

    const input = screen.getByTestId('chat-input');
    fireEvent.change(input, { target: { value: 'Make a quiz' } });
    fireEvent.click(screen.getByTestId('send-button'));

    await waitFor(() => {
      expect(screen.getByText(/I need a curriculum to work with/i)).toBeDefined();
    });
  });

  it('generates an assessment after curriculum is established', async () => {
    render(<App />);

    // Generate Curriculum
    generateContentMock.mockResolvedValueOnce({ text: JSON.stringify(MOCK_CURRICULUM) });
    const input = screen.getByTestId('chat-input');
    fireEvent.change(input, { target: { value: 'Create a Python course' } });
    fireEvent.click(screen.getByTestId('send-button'));
    await waitFor(() => screen.getByText('Python for Beginners'));

    // Generate Assessment
    const navAssessment = screen.getByTestId('nav-assessment');
    fireEvent.click(navAssessment);
    
    generateContentMock.mockResolvedValueOnce({ text: JSON.stringify(MOCK_ASSESSMENT) });
    const assessInput = screen.getByTestId('chat-input');
    fireEvent.change(assessInput, { target: { value: 'Create a quiz' } });
    fireEvent.click(screen.getByTestId('send-button'));

    await waitFor(() => {
      expect(screen.getByTestId('assessment-library')).toBeDefined();
    });
    expect(screen.getByText('Intro Quiz')).toBeDefined();
  });
});

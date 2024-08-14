import { Component, Prop, h } from '@stencil/core';

interface RichTextContent {
  data: Record<string, any>;
  content: Array<{
    data: Record<string, any>;
    content: Array<{
      data: Record<string, any>;
      marks: Array<any>;
      value: string;
      nodeType: string;
    }>;
    nodeType: string;
  }>;
  nodeType: string;
}

interface QuestionElement {
  type: 'radiogroup' | 'checkbox' | 'text' | 'boolean';
  name: string;
  title: string;
  choices?: string[];
  isRequired?: boolean;
  labelTrue?: string;
  labelFalse?: string;
}

interface QuestionPage {
  name: string;
  elements: QuestionElement[];
}

interface Questions {
  pages: QuestionPage[];
}

interface AssessmentItem {
  name: string;
  slug: string;
  intro: {
    json: RichTextContent;
  };
  resultsIntro: {
    json: RichTextContent;
  };
  questions: Questions;
}

interface AssessmentCollection {
  items: AssessmentItem[];
}

export interface AssessmentData {
  assessmentCollection: AssessmentCollection;
}

@Component({
  tag: 'assessment-form',
  styleUrl: 'assessment-form.css',
  shadow: true,
})
export class AssessmentForm {
  @Prop() assessmentData: AssessmentData;

  render() {
    return (
      <div class="bg-indigo-500 p-6 rounded-md flex justify-center">
        <h1 class="text-white font-sans">This is a Stencil component using Tailwind</h1>
      </div>
    );
  }
}

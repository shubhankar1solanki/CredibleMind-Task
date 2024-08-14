import { Component, Prop, State, h } from '@stencil/core';

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

interface AssessmentItem {
  name: string;
  slug: string;
  intro: {
    json: RichTextContent;
  };
  resultsIntro: {
    json: RichTextContent;
  };
  questions: {
    pages: QuestionPage[];
  };
}

export interface AssessmentData {
  assessmentCollection: { items: AssessmentItem[] };
}

@Component({
  tag: 'assessment-form',
  styleUrl: 'assessment-form.css',
  shadow: true,
})
export class AssessmentForm {
  @Prop() assessmentData: AssessmentData;

  @State() currentPage: number = 1;
  @State() progress: number = 1;
  @State() answers: { [key: number]: any } = {};

  handleAnswerChange(page: number, questionName: string, answer: any) {
    this.answers = {
      ...this.answers,
      [`${page}-${questionName}`]: answer,
    };
  }

  renderQuestion(question) {
    const { title, type, isRequired } = question;
    const answer = this.answers[`${this.currentPage}-${question.name}`] || '';

    switch (type) {
      case 'text':
        return (
          <text-field
            name={question.name}
            questionTitle={title}
            value={answer}
            isRequired={isRequired}
            onValueChange={e => this.handleAnswerChange(this.currentPage, question.name, e.detail)}
          />
        );
    }
  }

  render() {
    const currentPageData = this.assessmentData?.assessmentCollection.items[0].questions.pages[this.currentPage - 1].elements;
    const introTextTitle = this.assessmentData?.assessmentCollection.items[0].intro.json.content[0].content[0].value;

    return (
      <div class="max-w-2xl mx-auto p-5 bg-white shadow-md rounded-lg">
        <p class="text-2xl">{introTextTitle}</p>
        <div>
          {currentPageData?.map((question, index) => (
            <div key={index}>{this.renderQuestion(question)}</div>
          ))}
        </div>
      </div>
    );
  }
}

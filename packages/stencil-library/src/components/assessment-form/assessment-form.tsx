import { Component, Element, Event, EventEmitter, Prop, State, h } from '@stencil/core';

import ClockSvg from './assets/clock.svg';

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
  @State() isDescriptionTruncated: boolean = true;
  @State() estimatedTime: number = 2; // In Minutes

  @Event() completion: EventEmitter;
  @Event() pageChange: EventEmitter;

  @Element() el: HTMLElement;

  componentWillLoad() {
    this.calculateEstimatedTime();
  }

  calculateEstimatedTime() {
    const totalQuestions = this.assessmentData.assessmentCollection.items[0].questions.pages.reduce((acc, page) => acc + page.elements.length, 0);
    this.estimatedTime = (totalQuestions * 30) / 60;
  }

  handleAnswerChange(page: number, questionName: string, answer: any) {
    this.answers = {
      ...this.answers,
      [`${page}-${questionName}`]: answer,
    };
  }

  renderQuestion(question) {
    const { title, type, choices, labelFalse, labelTrue, isRequired } = question;
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
      case 'radiogroup':
        return (
          <radio-group
            name={question.name}
            questionTitle={title}
            choices={choices}
            value={answer}
            isRequired={isRequired}
            onValueChange={e => this.handleAnswerChange(this.currentPage, question.name, e.detail)}
          />
        );
      case 'checkbox':
        return (
          <checkbox-field
            name={question.name}
            questionTitle={title}
            choices={choices}
            value={answer}
            isRequired={isRequired}
            onValueChange={e => this.handleAnswerChange(this.currentPage, question.name, e.detail)}
          />
        );
      case 'boolean':
        return (
          <boolean-field
            name={question.name}
            title={title}
            labelTrue={labelTrue}
            labelFalse={labelFalse}
            value={answer}
            isRequired={isRequired}
            onValueChange={e => this.handleAnswerChange(this.currentPage, question.name, e.detail)}
          />
        );
    }
  }

  renderDescription() {
    const introDescription = this.assessmentData.assessmentCollection.items[0].intro.json.content
      .slice(1)
      .map(content => content.content.map(item => item.value).join(' '))
      .join(' ');

    return this.isDescriptionTruncated ? (
      <span>
        {introDescription.slice(0, 100)}...{' '}
        <span
          class="font-semibold cursor-pointer"
          onClick={() => {
            this.isDescriptionTruncated = false;
          }}
        >
          Read More
        </span>
      </span>
    ) : (
      <span>
        {introDescription}{' '}
        <span
          class="font-semibold cursor-pointer"
          onClick={() => {
            this.isDescriptionTruncated = true;
          }}
        >
          Read Less
        </span>
      </span>
    );
  }

  getUnansweredQuestions() {
    return this.assessmentData.assessmentCollection.items[0].questions.pages[this.currentPage - 1].elements.filter(question => {
      return !this.answers[`${this.currentPage}-${question.name}`];
    });
  }

  scrollToUnanswered(question) {
    const element = this.el.shadowRoot?.querySelector(`#question-${question.name}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  handleNext() {
    const unanswered = this.getUnansweredQuestions();
    if (unanswered.length > 0) {
      this.scrollToUnanswered(unanswered[0]);
    } else if (this.currentPage < this.assessmentData.assessmentCollection.items[0].questions.pages.length) {
      this.currentPage++;
      this.pageChange.emit(this.currentPage);
    } else {
      // Submit answers
    }
  }

  handlePrev() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.pageChange.emit(this.currentPage);
    }
  }

  render() {
    if (!this.assessmentData) {
      return <div class="animate-spin"></div>;
    }

    const currentPageData = this.assessmentData.assessmentCollection.items[0].questions.pages[this.currentPage - 1].elements;
    const introTextTitle = this.assessmentData.assessmentCollection.items[0].intro.json.content[0].content[0].value;

    return (
      <div class="max-w-2xl mx-auto bg-white border border-slate-200 rounded-lg">
        {/* head */}
        <div class="bg-[#F8EDEB] p-5 rounded-t-lg">
          <p class="text-2xl text-[#4B4B4B] font-bold">{introTextTitle}</p>
          <p class="flex gap-1 mt-3">
            <img src={ClockSvg} /> <span class="text-[#4B4B4B]">It only takes {this.estimatedTime} minutes.</span>
          </p>
          <p class="text-base text-[#4B4B4B] mt-3">{this.renderDescription()}</p>
        </div>
        {/* Progress */}
        <div class="h-2 bg-blue-500 rounded-full mb-4" style={{ width: `${this.progress}%` }}></div>
        {/* Questions */}
        <div class="p-5 shadow-inner">
          {currentPageData?.map((question, index) => (
            <div key={index}>{this.renderQuestion(question)}</div>
          ))}
        </div>

        {/* Navigation */}
        <div class="flex justify-between mt-4">
          <button
            onClick={() => this.handlePrev()}
            disabled={this.currentPage === 1}
            class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-l disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button onClick={() => this.handleNext()} class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r">
            Next
          </button>
        </div>
      </div>
    );
  }
}

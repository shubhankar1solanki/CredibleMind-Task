import { Component, Element, Event, EventEmitter, Prop, State, h } from '@stencil/core';
import algoliasearch from 'algoliasearch/lite';

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
  @State() algoliaResults: any[] = [];

  @Event() completion: EventEmitter;
  @Event() pageChange: EventEmitter;

  @Element() el: HTMLElement;

  private index: any;

  componentWillLoad() {
    const client = algoliasearch('4WK61QBPDU', 'a3a8a3edba3b7ba9dad65b2984b91e69');
    this.index = client.initIndex('algolia-recommendation-data');
  }

  calculateEstimatedTime() {
    const totalQuestions = this.assessmentData.assessmentCollection.items[0].questions.pages.reduce((acc, page) => acc + page.elements.length, 0);
    return (totalQuestions * 30) / 60;
  }

  handleAnswerChange(questionName: string, answer: any) {
    this.answers = {
      ...this.answers,
      [questionName]: answer,
    };

    this.updateProgress();
  }

  renderQuestion(question) {
    const { title, type, choices, labelFalse, labelTrue, isRequired } = question;
    const answer = this.answers[question.name] || '';

    switch (type) {
      case 'text':
        return (
          <text-field name={question.name} questionTitle={title} value={answer} isRequired={isRequired} onValueChange={e => this.handleAnswerChange(question.name, e.detail)} />
        );
      case 'radiogroup':
        return (
          <radio-group
            name={question.name}
            questionTitle={title}
            choices={choices}
            value={answer}
            isRequired={isRequired}
            onValueChange={e => this.handleAnswerChange(question.name, e.detail)}
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
            onValueChange={e => this.handleAnswerChange(question.name, e.detail)}
          />
        );
      case 'boolean':
        return (
          <boolean-field
            name={question.name}
            questionTitle={title}
            labelTrue={labelTrue}
            labelFalse={labelFalse}
            value={answer}
            isRequired={isRequired}
            onValueChange={e => this.handleAnswerChange(question.name, e.detail)}
          />
        );
    }
  }

  renderDescription(isResult: boolean = false) {
    const description = this.assessmentData.assessmentCollection.items[0][isResult ? 'resultsIntro' : 'intro'].json.content
      .slice(isResult ? 0 : 1)
      .map(content => content.content.map(item => item.value).join(' '))
      .join(' ');

    if (description.length < 100) {
      return description;
    }

    return this.isDescriptionTruncated ? (
      <span>
        {description.slice(0, 100)}...{' '}
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
        {description}{' '}
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
      return Array.isArray(this.answers[question.name]) ? this.answers[question.name].length === 0 : !this.answers[question.name];
    });
  }

  scrollToUnanswered(question) {
    const element = this.el.shadowRoot?.querySelector(`#question-${question.name}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  updateProgress() {
    const totalPages = this.assessmentData.assessmentCollection.items[0].questions.pages.length;
    this.progress = ((this.currentPage - 1) / totalPages) * 100;
  }

  handleNext() {
    const unanswered = this.getUnansweredQuestions();
    console.log(unanswered, { currentPage: this.currentPage });
    if (unanswered.length > 0) {
      this.scrollToUnanswered(unanswered[0]);
    } else if (this.currentPage < this.assessmentData.assessmentCollection.items[0].questions.pages.length) {
      this.currentPage++;
      this.pageChange.emit(this.currentPage);
    } else {
      this.submitAnswers();
    }
  }

  handlePrev() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.pageChange.emit(this.currentPage);
    }
  }

  async submitAnswers() {
    try {
      const facetFilters = Object.entries(this.answers)
        .map(([key, value]) => {
          if (Array.isArray(value)) {
            return value.map(v => `relevantTo:${key}:${v}`);
          } else if (typeof value === 'boolean') {
            return `relevantTo:${key}:${value ? 'Yes' : 'No'}`;
          } else {
            return `relevantTo:${key}:${value}`;
          }
        })
        .flat();
      const response = await this.index.search('', { facetFilters: [facetFilters] });
      this.algoliaResults = response.hits;
      this.currentPage++;
      this.completion.emit(this.answers);
    } catch (error) {
      console.error('Algolia search error:', error);
      // Fallback logic
    }
  }

  render() {
    if (!this.assessmentData) {
      return <div class="animate-spin"></div>;
    }

    if (this.currentPage <= this.assessmentData.assessmentCollection.items[0].questions.pages.length) {
      const currentPageData = this.assessmentData.assessmentCollection.items[0].questions.pages[this.currentPage - 1].elements;
      const introTextTitle = this.assessmentData.assessmentCollection.items[0].intro.json.content[0].content[0].value;

      return (
        <div class="max-w-2xl mx-auto bg-white border border-slate-200 rounded-lg">
          {/* head */}
          <div class="bg-[#F8EDEB] p-5 rounded-t-lg">
            <p class="text-2xl text-[#4B4B4B] font-bold">{introTextTitle}</p>
            <p class="flex gap-1 mt-3">
              <img src={ClockSvg} /> <span class="text-[#4B4B4B]">It only takes {this.calculateEstimatedTime()} minutes.</span>
            </p>
            <p class="text-base text-[#4B4B4B] mt-3">{this.renderDescription()}</p>
          </div>
          {/* Progress */}
          <div class="absolute h-2 bg-blue-500 rounded-full" style={{ width: `${this.progress}%` }}></div>
          {/* Questions */}
          <div class="p-5 shadow-inner">
            {currentPageData?.map((question, index) => (
              <div key={index}>{this.renderQuestion(question)}</div>
            ))}
          </div>

          {/* Navigation */}
          <div class="flex justify-between mt-1">
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

    return (
      <div class="max-w-2xl mx-auto bg-white border border-slate-200 rounded-lg">
        {/* head */}
        <div class="bg-[#F8EDEB] p-5 rounded-t-lg">
          <p class="text-base text-[#4B4B4B] mt-3">{this.renderDescription(true)}</p>
        </div>
        <div class="mt-6 grid grid-cols-3 gap-3">
          {this.algoliaResults.map(result => (
            <div class="mb-4 p-4 border rounded-lg shadow">
              <img src={result.imageUrl} alt={result.title} class="w-full h-48 object-cover mb-4" />
              <h3 class="text-xl font-semibold">{result.title}</h3>
              <p class="text-sm text-gray-600">Author: {result.author}</p>
              <p class="text-sm text-gray-600">Type: {result.type}</p>
              <p class="text-sm text-gray-700 mt-2">{result.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

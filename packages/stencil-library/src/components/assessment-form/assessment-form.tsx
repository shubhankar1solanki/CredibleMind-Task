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
  @State() isResultLoading: boolean = false;
  @State() errors: { [key: string]: string } = {};

  @Event() completion: EventEmitter;
  @Event() pageChange: EventEmitter;

  @Element() el: HTMLElement;

  private index: any;

  componentWillLoad() {
    const client = algoliasearch('4WK61QBPDU', 'a3a8a3edba3b7ba9dad65b2984b91e69');
    this.index = client.initIndex('algolia-recommendation-data');
  }

  componentDidRender() {
    this.updateProgress();
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

    // Clear error when user answers the question
    this.errors = {
      ...this.errors,
      [questionName]: '',
    };
  }

  renderQuestion(question) {
    const { title, type, choices, labelFalse, labelTrue } = question;
    const answer = this.answers[question.name] || '';

    const error = this.errors[question.name];
    console.log(error);

    switch (type) {
      case 'text':
        return <text-field name={question.name} questionTitle={title} value={answer} errorMessage={error} onValueChange={e => this.handleAnswerChange(question.name, e.detail)} />;
      case 'radiogroup':
        return (
          <radio-group
            name={question.name}
            questionTitle={title}
            choices={choices}
            value={answer}
            errorMessage={error}
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
            errorMessage={error}
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
            errorMessage={error}
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
    this.progress = (this.currentPage / totalPages) * 100;
  }

  validateCurrentPage() {
    const currentPageData = this.assessmentData.assessmentCollection.items[0].questions.pages[this.currentPage - 1].elements;
    let valid = true;

    currentPageData.forEach(question => {
      if (!this.answers[question.name]) {
        valid = false;
        this.errors = {
          ...this.errors,
          [question.name]: `Answer is required for this question.`,
        };
      } else {
        this.errors = {
          ...this.errors,
          [question.name]: '',
        };
      }
    });

    return valid;
  }

  handleNext() {
    if (this.validateCurrentPage()) {
      if (this.currentPage < this.assessmentData.assessmentCollection.items[0].questions.pages.length) {
        this.currentPage++;
        this.pageChange.emit(this.currentPage);
      } else {
        this.isResultLoading = true;
        this.submitAnswers();
      }
    } else {
      const unanswered = this.getUnansweredQuestions();
      if (unanswered.length > 0) {
        this.scrollToUnanswered(unanswered[0]);
      }
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
      this.isResultLoading = false;
    } catch (error) {
      console.error('Algolia search error:', error);
      this.isResultLoading = false;
      // Fallback logic
    }
  }

  render() {
    if (!this.assessmentData || this.isResultLoading) {
      return (
        <div class="max-w-2xl mx-auto flex justify-center items-center bg-white h-full">
          <svg
            aria-hidden="true"
            role="status"
            class="inline w-4 h-4 me-3 text-gray-200 animate-spin dark:text-gray-600"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="#1C64F2"
            />
          </svg>
          Loading...
        </div>
      );
    }

    if (this.currentPage <= this.assessmentData.assessmentCollection.items[0].questions.pages.length) {
      const currentPageData = this.assessmentData.assessmentCollection.items[0].questions.pages[this.currentPage - 1].elements;
      const introTextTitle = this.assessmentData.assessmentCollection.items[0].intro.json.content[0].content[0].value;

      return (
        <div class="max-w-2xl mx-auto bg-white border border-slate-200 rounded-lg relative">
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
        {}
        {this.algoliaResults.length > 0 ? (
          <div class="mt-3 grid grid-cols-3 gap-3 mx-3">
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
        ) : (
          <div class="mt-6">No results found for your answers.</div>
        )}
      </div>
    );
  }
}

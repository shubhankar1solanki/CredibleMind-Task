import { Component, h, Prop, Event, EventEmitter } from '@stencil/core';

@Component({
  tag: 'radio-group',
  styleUrl: 'radio-group.css',
  shadow: true,
})
export class RadioGroupComponent {
  @Prop() name: string;
  @Prop() questionTitle: string;
  @Prop() choices: string[];
  @Prop() value: string;
  @Prop() isRequired: boolean;

  @Event() valueChange: EventEmitter;

  handleInputChange(choice: string) {
    this.valueChange.emit(choice);
  }

  render() {
    return (
      <div class="mb-4" id={`question-${this.questionTitle}`}>
        <label class="block text-gray-700 text-sm font-bold mb-2">
          {this.questionTitle}
          {this.isRequired ? '*' : ''}
        </label>
        {this.choices.map(choice => (
          <div>
            <input type="radio" name={this.name} value={choice} checked={this.value === choice} onChange={() => this.handleInputChange(choice)} />
            <label class="ml-2">{choice}</label>
          </div>
        ))}
        <div class="text-red-500 text-xs mt-1" hidden={this.value ? true : false}>
          {this.isRequired && 'This question is required.'}
        </div>
      </div>
    );
  }
}

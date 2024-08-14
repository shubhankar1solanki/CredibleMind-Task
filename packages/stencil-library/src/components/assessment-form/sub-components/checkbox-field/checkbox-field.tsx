import { Component, h, Prop, State, Event, EventEmitter } from '@stencil/core';

@Component({
  tag: 'checkbox-field',
  styleUrl: 'checkbox-field.css',
  shadow: true,
})
export class CheckboxFieldComponent {
  @Prop() name: string;
  @Prop() questionTitle: string;
  @Prop() choices: string[];
  @Prop() value: string[];
  @Prop() isRequired: boolean;

  @Event() valueChange: EventEmitter;

  @State() selectedValues: string[] = [];

  componentWillLoad() {
    this.selectedValues = this.value || [];
  }

  handleInputChange(choice: string) {
    const updatedValues = this.selectedValues.includes(choice) ? this.selectedValues.filter(v => v !== choice) : [...this.selectedValues, choice];

    this.selectedValues = updatedValues;
    this.valueChange.emit(updatedValues);
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
            <input type="checkbox" value={choice} checked={this.selectedValues.includes(choice)} onChange={() => this.handleInputChange(choice)} />
            <label class="ml-2">{choice}</label>
          </div>
        ))}
        <div class="text-red-500 text-xs mt-1" hidden={this.selectedValues.length > 0}>
          {this.isRequired && 'This question is required.'}
        </div>
      </div>
    );
  }
}

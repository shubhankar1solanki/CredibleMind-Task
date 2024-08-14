import { Component, h, Prop, Event, EventEmitter } from '@stencil/core';

@Component({
  tag: 'boolean-field',
  styleUrl: 'boolean-field.css',
  shadow: true,
})
export class BooleanFieldComponent {
  @Prop() name: string;
  @Prop() questionTitle: string;
  @Prop() labelTrue: string;
  @Prop() labelFalse: string;
  @Prop() value: string;
  @Prop() isRequired: boolean;

  @Event() valueChange: EventEmitter;

  handleInputChange(value: string) {
    this.valueChange.emit(value);
  }

  render() {
    return (
      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2">
          {this.questionTitle}
          {this.isRequired ? '*' : ''}
        </label>
        <div>
          <input type="radio" name={this.name} value="true" checked={this.value === 'true'} onChange={() => this.handleInputChange('true')} />
          <label class="ml-2">{this.labelTrue}</label>
        </div>
        <div>
          <input type="radio" name={this.name} value="false" checked={this.value === 'false'} onChange={() => this.handleInputChange('false')} />
          <label class="ml-2">{this.labelFalse}</label>
        </div>
        <div class="text-red-500 text-xs mt-1" hidden={this.value !== undefined}>
          {this.isRequired && 'This question is required.'}
        </div>
      </div>
    );
  }
}

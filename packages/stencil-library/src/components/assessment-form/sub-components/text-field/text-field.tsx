import { Component, h, Prop, Event, EventEmitter } from '@stencil/core';

@Component({
  tag: 'text-field',
  styleUrl: 'text-field.css',
  shadow: true,
})
export class TextFieldComponent {
  @Prop() name: string;
  @Prop() questionTitle: string;
  @Prop() value: string;
  @Prop() isRequired: boolean;

  @Event() valueChange: EventEmitter;

  handleInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.valueChange.emit(input.value);
  }

  render() {
    return (
      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2">
          {this.questionTitle}
          {this.isRequired ? '*' : ''}
        </label>
        <input
          type="text"
          value={this.value}
          onInput={e => this.handleInputChange(e)}
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
        <div class="text-red-500 text-xs mt-1" hidden={this.value ? true : false}>
          {this.isRequired && 'This question is required.'}
        </div>
      </div>
    );
  }
}

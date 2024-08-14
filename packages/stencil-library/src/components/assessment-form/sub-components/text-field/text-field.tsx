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
  @Prop() errorMessage: string;

  @Event() valueChange: EventEmitter;

  handleInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.valueChange.emit(input.value);
  }

  render() {
    return (
      <div class="mb-4" id={`question-${this.questionTitle}`}>
        <label class="block text-gray-700 text-sm font-bold mb-2">{this.questionTitle}</label>
        <textarea
          rows={3}
          value={this.value}
          onInput={e => this.handleInputChange(e)}
          class="mt-1 block w-full appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
        <div class="text-red-500 text-xs mt-1" hidden={!this.errorMessage ? true : false}>
          {this.errorMessage && this.errorMessage}
        </div>
      </div>
    );
  }
}

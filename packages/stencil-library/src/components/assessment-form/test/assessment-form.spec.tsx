import { newSpecPage } from '@stencil/core/testing';
import { AssessmentForm } from '../assessment-form';

describe('assessment-form', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [AssessmentForm],
      html: `<assessment-form></assessment-form>`,
    });
    expect(page.root).toEqualHtml(`
      <assessment-form>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </assessment-form>
    `);
  });
});

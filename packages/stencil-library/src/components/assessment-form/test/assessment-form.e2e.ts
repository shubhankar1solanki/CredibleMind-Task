import { newE2EPage } from '@stencil/core/testing';

describe('assessment-form', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<assessment-form></assessment-form>');

    const element = await page.find('assessment-form');
    expect(element).toHaveClass('hydrated');
  });
});

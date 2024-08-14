import { Config } from '@stencil/core';
import { reactOutputTarget } from '@stencil/react-output-target';
import tailwind, { tailwindHMR, TailwindConfig } from 'stencil-tailwind-plugin';

import cfg from './tailwind.config';

const twConfigurationFn = (_filename: string, config: TailwindConfig): TailwindConfig => {
  return {
    ...config,
    ...cfg,
  };
};

const tailwindOpts = {
  tailwindConf: twConfigurationFn,
};

export const config: Config = {
  namespace: 'stencil-library',
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'dist-custom-elements',
      customElementsExportBehavior: 'auto-define-custom-elements',
      externalRuntime: false,
    },
    {
      type: 'docs-readme',
    },
    {
      type: 'www',
      serviceWorker: null, // disable service workers
    },
    reactOutputTarget({
      componentCorePackage: 'stencil-library',
      proxiesFile: '../react-library/lib/components/stencil-generated/index.ts',
    }),
  ],
  plugins: [tailwind(tailwindOpts), tailwindHMR()],
  devServer: {
    reloadStrategy: 'pageReload',
  },
  testing: {
    browserHeadless: 'new',
  },
};

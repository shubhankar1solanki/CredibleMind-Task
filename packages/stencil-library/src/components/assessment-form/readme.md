# assessment-form



<!-- Auto Generated Below -->


## Properties

| Property         | Attribute | Description | Type             | Default     |
| ---------------- | --------- | ----------- | ---------------- | ----------- |
| `assessmentData` | --        |             | `AssessmentData` | `undefined` |


## Events

| Event        | Description | Type               |
| ------------ | ----------- | ------------------ |
| `completion` |             | `CustomEvent<any>` |
| `pageChange` |             | `CustomEvent<any>` |


## Dependencies

### Depends on

- [text-field](./sub-components/text-field)
- [radio-group](./sub-components/radio-group)
- [checkbox-field](./sub-components/checkbox-field)
- [boolean-field](./sub-components/boolean-field)

### Graph
```mermaid
graph TD;
  assessment-form --> text-field
  assessment-form --> radio-group
  assessment-form --> checkbox-field
  assessment-form --> boolean-field
  style assessment-form fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*

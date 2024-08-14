// App.tsx
import "./App.css";
import { AssessmentForm, defineCustomElements } from "react-library";

import useGetFormData from "./hooks/useFormData";

defineCustomElements();

function App() {
  const { data, isLoading } = useGetFormData();

  return (
    <div className="App">
      {data && !isLoading && <AssessmentForm assessmentData={data} />}
    </div>
  );
}

export default App;

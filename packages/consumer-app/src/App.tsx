// App.tsx
import "./App.css";
import { AssessmentForm, defineCustomElements } from "react-library";

defineCustomElements();

function App() {
  return (
    <div className="App">
      <AssessmentForm />
    </div>
  );
}

export default App;

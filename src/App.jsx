import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SentimentAnalyzer from "./Sentiment-Analyzer";
import './App.css';
function App() {
  return (
    <Router>
      <Routes>
  
        <Route path="/" element={<SentimentAnalyzer />} />
      </Routes>
    </Router>
  );
}

export default App;

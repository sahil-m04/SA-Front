import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { HiOutlineSearchCircle } from 'react-icons/hi';
import './AssetSentimentAnalyzer.css'; 

function AssetSentimentAnalyzer() {
  const [asset, setAsset] = useState('');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const analyzeSentiment = async () => {
    setLoading(true);
    setError('');
    setArticles([]);

    try {
      const response = await fetch('http://127.0.0.1:8000/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ asset }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch data');
      }

      const data = await response.json();
      setArticles(data.articles);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sentimentCounts = articles.reduce((counts, article) => {
    const sentiment = article.sentiment.label.toLowerCase();
    counts[sentiment] = (counts[sentiment] || 0) + 1;
    return counts;
  }, {});

  const chartData = Object.keys(sentimentCounts).map((key) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: sentimentCounts[key],
  }));

  const colorMap = {
    positive: '#25D366',
    neutral: '#ff9800',
    negative: '#f44336',
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? dateStr : date.toLocaleDateString();
  };

  const getSentimentStyle = (label) => {
    switch (label.toLowerCase()) {
      case 'positive':
        return 'positive';
      case 'neutral':
        return 'neutral';
      case 'negative':
        return 'negative';
      default:
        return '';
    }
  };

  return (
    <div className="analyzer-container">
      <h2 className="title">Financial Sentiment Analyzer</h2>

      <div className="input-section">
        <input
          type="text"
          value={asset}
          onChange={(e) => setAsset(e.target.value)}
          placeholder="Enter asset name (e.g., Tesla, Bitcoin)"
          className="input-box"
        />
        <button
          onClick={analyzeSentiment}
          disabled={loading}
          className="analyze-button"
        >
          {loading ? 'Analyzing...' : 'Analyze'}
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}

      {!loading && !error && articles.length === 0 && (
        <div className="placeholder">
          <HiOutlineSearchCircle className="icon" />
          <p className="placeholder-title">Ready to uncover insights?</p>
          <p className="placeholder-description">
            Enter the name of a financial asset like <strong>Tesla</strong> or{' '}
            <strong>Bitcoin</strong> above, and we’ll dig through the latest news to analyze the sentiment for you.
          </p>
        </div>
      )}

      {articles.length > 0 && (
        <>
          <div className="chart-section">
            <h3 className="chart-title">Sentiment Distribution</h3>
            <PieChart width={400} height={300}>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colorMap[entry.name.toLowerCase()] || '#ccc'}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>

          <div className="table-wrapper">
            <table className="articles-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Published</th>
                  <th>Sentiment</th>
                  <th>Score</th>
                  <th>Link</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article, index) => (
                  <tr key={index}>
                    <td>{article.title}</td>
                    <td>{article.description}</td>
                    <td>{formatDate(article.date)}</td>
                    <td className={getSentimentStyle(article.sentiment.label)}>
                      {article.sentiment.label}
                    </td>
                    <td>{article.sentiment.score.toFixed(2)}</td>
                    <td>
                      <a href={article.link} target="_blank" rel="noreferrer">
                        Read More
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default AssetSentimentAnalyzer;

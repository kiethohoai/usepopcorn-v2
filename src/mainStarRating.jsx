import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import StarRating from './StarRating';
// import './index.css'
// import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <StarRating />
    <StarRating
      size={28}
      color="red"
      className="test"
      message={['Terible', 'Bad', 'Ok', 'Good', 'Amazing']}
      defaultRating={3}
    />
  </StrictMode>,
);

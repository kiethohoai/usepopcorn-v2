import { useEffect } from 'react';
import Header from './Header';
import MainApp from './MainApp';
import { useReducer } from 'react';

const initialState = {
  questions: [],
  status: 'loading', //loading, error, ready, active, finish
};

function reducer(state, action) {
  switch (action.type) {
    case 'dataReceived':
      return {
        ...state,
        questions: action.payload,
        status: `ready`,
      };
    case 'dataFailed':
      return {
        ...state,
        status: `error`,
      };
    default:
      throw new Error(`Something went wrong!`);
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    fetch(`http://localhost:8000/questions`)
      .then((res) => res.json())
      .then((data) => dispatch({ type: 'dataReceived', payload: data }))
      .catch(() => dispatch({ type: 'dataFailed' }));
  }, []);
  return (
    <div className="app">
      <Header />
      <MainApp>
        <p>1/15</p>
        <p>Question</p>
      </MainApp>
    </div>
  );
}

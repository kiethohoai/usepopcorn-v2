import { useEffect } from 'react';
import Header from './Header';
import MainApp from './MainApp';
import { useReducer } from 'react';
import Loader from './Loader';
import Error from './Error';
import StartScreen from './StartScreen';
import Questions from './Questions';

const initialState = {
  questions: [],
  status: 'loading', //loading, error, ready, active, finish
  index: 0,
  answer: null,
  points: 0,
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
    case 'start':
      return {
        ...state,
        status: `active`,
      };
    case 'newAnswer': {
      const question = state.questions[state.index];
      return {
        ...state,
        answer: action.payload,
        points:
          question.correctOption === action.payload
            ? state.points + question.points
            : state.points,
      };
    }
    default:
      throw new Error(`Something went wrong!`);
  }
}

export default function App() {
  const [{ questions, status, index, answer }, dispatch] = useReducer(
    reducer,
    initialState,
  );
  const numQuestions = questions.length;

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
        {status === 'loading' && <Loader />}
        {status === 'error' && <Error />}
        {status === 'ready' && (
          <StartScreen numQuestions={numQuestions} dispatch={dispatch} />
        )}
        {status === 'active' && (
          <Questions question={questions[index]} dispatch={dispatch} answer={answer} />
        )}
      </MainApp>
    </div>
  );
}

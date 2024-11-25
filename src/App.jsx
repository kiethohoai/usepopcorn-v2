import { useEffect } from 'react';
import Header from './Header';
import MainApp from './MainApp';
import { useReducer } from 'react';
import Loader from './Loader';
import Error from './Error';
import StartScreen from './StartScreen';
import Questions from './Questions';
import NextButton from './NextButton';
import Progress from './Progress';
import FinishedScreen from './FinishedScreen';

const initialState = {
  questions: [],
  status: 'loading', //loading, error, ready, active, finish
  index: 0,
  answer: null,
  points: 0,
  highscore: 0,
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
          question.correctOption === action.payload ? state.points + question.points : state.points,
      };
    }
    case 'nextQuestion': {
      return { ...state, index: state.index + 1, answer: null };
    }
    case 'finish': {
      return {
        ...state,
        status: 'finish',
        highscore: state.highscore < state.points ? state.points : state.highscore,
      };
    }
    case 'restart': {
      return {
        ...state,
        status: 'ready',
        index: 0,
        answer: null,
        points: 0,
      };
    }
    default:
      throw new Error(`Something went wrong!`);
  }
}

export default function App() {
  const [{ questions, status, index, answer, points, highscore }, dispatch] = useReducer(
    reducer,
    initialState,
  );
  const numQuestions = questions.length;
  const maxPoints = questions.reduce((acc, cur) => acc + cur.points, 0);

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
        {status === 'ready' && <StartScreen numQuestions={numQuestions} dispatch={dispatch} />}
        {status === 'active' && (
          <>
            <Progress
              numQuestions={numQuestions}
              index={index}
              points={points}
              maxPoints={maxPoints}
            />
            <Questions question={questions[index]} dispatch={dispatch} answer={answer} />
            <NextButton
              dispatch={dispatch}
              answer={answer}
              index={index}
              numQuestions={numQuestions}
            />
          </>
        )}
        {status === 'finish' && (
          <FinishedScreen
            points={points}
            maxPoints={maxPoints}
            highscore={highscore}
            dispatch={dispatch}
          />
        )}
      </MainApp>
    </div>
  );
}

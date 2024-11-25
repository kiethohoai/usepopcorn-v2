import NextButton from './NextButton';

function FinishedScreen({ points, maxPoints, highscore, dispatch }) {
  const percentage = Math.ceil((points / maxPoints) * 100);
  return (
    <>
      <p className="result">{`Your score ${points} out of ${maxPoints} (${percentage}%)`}</p>
      <p className="highscore">{`(Highscore: ${highscore} points)`}</p>
      <button className="btn btn-ui" onClick={() => dispatch({ type: 'restart' })}>
        Restart Game
      </button>
    </>
  );
}

export default FinishedScreen;
